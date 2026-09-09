// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract Hangman {
    // ─────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────

    enum Status {
        None,
        Active,
        Won,
        Lost
    }

    struct Game {
        bytes32 wordHash;      // keccak256 of the lowercase word
        uint8   wordLength;    // length of the secret word (1-20)
        uint32  guessed;       // bitmask of guessed letters (bit 0 = 'a', bit 25 = 'z')
        uint8   lives;         // remaining lives (starts at 6)
        uint8   correctCount;  // how many unique correct letters so far
        Status  status;
        uint64  startedAt;
    }

    struct PlayerStats {
        uint32  wins;
        uint32  losses;
        uint32  gamesPlayed;
        uint256 totalScore;
        uint64  lastPlayed;
    }

    // ─────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────

    mapping(address => Game) public games;
    mapping(address => PlayerStats) public stats;

    // Simple leaderboard: we keep an array of top addresses (capped)
    address[] public leaderboard;
    uint256 public constant MAX_LEADERBOARD = 20;

    uint8 public constant MAX_LIVES = 6;
    uint8 public constant MIN_WORD_LEN = 3;
    uint8 public constant MAX_WORD_LEN = 20;

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────

    event GameStarted(address indexed player, bytes32 wordHash, uint8 wordLength);
    event LetterGuessed(address indexed player, bytes1 letter, bool correct, uint8 livesLeft);
    event GameWon(address indexed player, uint256 scoreEarned, uint256 newTotalScore);
    event GameLost(address indexed player);
    event ScoreUpdated(address indexed player, uint256 totalScore);

    // ─────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────

    error GameAlreadyActive();
    error NoActiveGame();
    error InvalidWordLength();
    error InvalidLetter();
    error LetterAlreadyGuessed();
    error GameNotActive();

    // ─────────────────────────────────────────────
    // Game Logic
    // ─────────────────────────────────────────────

    /**
     * @notice Start a new game. Caller must know the word.
     * @param wordHash keccak256(abi.encodePacked(lowercaseWord))
     * @param wordLength Length of the secret word
     */
    function startGame(bytes32 wordHash, uint8 wordLength) external {
        if (games[msg.sender].status == Status.Active) revert GameAlreadyActive();
        if (wordLength < MIN_WORD_LEN || wordLength > MAX_WORD_LEN) revert InvalidWordLength();

        games[msg.sender] = Game({
            wordHash: wordHash,
            wordLength: wordLength,
            guessed: 0,
            lives: MAX_LIVES,
            correctCount: 0,
            status: Status.Active,
            startedAt: uint64(block.timestamp)
        });

        stats[msg.sender].gamesPlayed += 1;
        stats[msg.sender].lastPlayed = uint64(block.timestamp);

        emit GameStarted(msg.sender, wordHash, wordLength);
    }


    function guessLetter(
        bytes1 letter,
        bool isCorrect,
        uint32 /* positionsBitmask */,
        string calldata fullWord
    ) external {
        Game storage g = games[msg.sender];
        if (g.status != Status.Active) revert NoActiveGame();

        uint8 idx = _letterIndex(letter);
        if (idx == 255) revert InvalidLetter();

        uint32 bit = uint32(1) << idx;
        if (g.guessed & bit != 0) revert LetterAlreadyGuessed();

        g.guessed |= bit;

        if (isCorrect) {
            g.correctCount += 1;
            emit LetterGuessed(msg.sender, letter, true, g.lives);

            // Check if player claims the word is complete
            if (bytes(fullWord).length == g.wordLength) {
                bytes32 claimedHash = keccak256(abi.encodePacked(fullWord));
                if (claimedHash == g.wordHash) {
                    _win(g, fullWord);
                    return;
                }
            }
        } else {
            g.lives -= 1;
            emit LetterGuessed(msg.sender, letter, false, g.lives);

            if (g.lives == 0) {
                g.status = Status.Lost;
                stats[msg.sender].losses += 1;
                emit GameLost(msg.sender);
            }
        }
    }


    function claimWin(string calldata fullWord) external {
        Game storage g = games[msg.sender];
        if (g.status != Status.Active) revert GameNotActive();
        if (bytes(fullWord).length != g.wordLength) revert InvalidWordLength();

        bytes32 claimedHash = keccak256(abi.encodePacked(fullWord));
        require(claimedHash == g.wordHash, "Wrong word");

        _win(g, fullWord);
    }

    // ─────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────

    function _win(Game storage g, string calldata /* fullWord */) internal {
        g.status = Status.Won;

        // Simple scoring: base 100 + 20 per remaining life + 5 per correct letter
        uint256 score = 100 + (uint256(g.lives) * 20) + (uint256(g.correctCount) * 5);

        PlayerStats storage s = stats[msg.sender];
        s.wins += 1;
        s.totalScore += score;

        _updateLeaderboard(msg.sender);

        emit GameWon(msg.sender, score, s.totalScore);
        emit ScoreUpdated(msg.sender, s.totalScore);
    }

    function _letterIndex(bytes1 letter) internal pure returns (uint8) {
        if (letter >= "a" && letter <= "z") {
            return uint8(uint8(letter) - uint8(bytes1("a")));
        }
        if (letter >= "A" && letter <= "Z") {
            return uint8(uint8(letter) - uint8(bytes1("A")));
        }
        return 255; // invalid
    }

    function _updateLeaderboard(address player) internal {
        // Very simple insertion: keep sorted by totalScore descending, max 20
        uint256 playerScore = stats[player].totalScore;

        // If already on board, we will re-sort later
        bool exists = false;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i] == player) {
                exists = true;
                break;
            }
        }

        if (!exists && leaderboard.length < MAX_LEADERBOARD) {
            leaderboard.push(player);
        } else if (!exists) {
            // Replace the lowest if better
            uint256 lowestIdx = 0;
            uint256 lowestScore = stats[leaderboard[0]].totalScore;
            for (uint256 i = 1; i < leaderboard.length; i++) {
                uint256 sc = stats[leaderboard[i]].totalScore;
                if (sc < lowestScore) {
                    lowestScore = sc;
                    lowestIdx = i;
                }
            }
            if (playerScore > lowestScore) {
                leaderboard[lowestIdx] = player;
            }
        }

        // Bubble the player up (simple sort for small N)
        for (uint256 i = 0; i < leaderboard.length; i++) {
            for (uint256 j = i + 1; j < leaderboard.length; j++) {
                if (stats[leaderboard[j]].totalScore > stats[leaderboard[i]].totalScore) {
                    address tmp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = tmp;
                }
            }
        }
    }

    // ─────────────────────────────────────────────
    // Views
    // ─────────────────────────────────────────────

    function getGame(address player) external view returns (
        bytes32 wordHash,
        uint8 wordLength,
        uint32 guessed,
        uint8 lives,
        uint8 correctCount,
        Status status,
        uint64 startedAt
    ) {
        Game storage g = games[player];
        return (
            g.wordHash,
            g.wordLength,
            g.guessed,
            g.lives,
            g.correctCount,
            g.status,
            g.startedAt
        );
    }

    function getPlayerStats(address player) external view returns (
        uint32 wins,
        uint32 losses,
        uint32 gamesPlayed,
        uint256 totalScore,
        uint64 lastPlayed
    ) {
        PlayerStats storage s = stats[player];
        return (s.wins, s.losses, s.gamesPlayed, s.totalScore, s.lastPlayed);
    }

    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        uint256 len = leaderboard.length;
        address[] memory addrs = new address[](len);
        uint256[] memory scores = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            addrs[i] = leaderboard[i];
            scores[i] = stats[leaderboard[i]].totalScore;
        }
        return (addrs, scores);
    }

    function leaderboardLength() external view returns (uint256) {
        return leaderboard.length;
    }
}
