import { useState } from "react";

export default function Layout() {
  return (
    <>
      <div className="layout">
        <Header />
        <Game />
      </div>
      <Footer />
    </>
  );
}

function Game() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), lastMove: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, i) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, lastMove: i },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleSorting() {
    setIsAscending(!isAscending);
  }

  function resetGame() {
    setHistory([{ squares: Array(9).fill(null), lastMove: null }]);
    setCurrentMove(0);
    setIsAscending(true);
  }

  const moves = history.map((entry, move) => {
    let description;
    if (move > 0) {
      const { lastMove } = entry;
      const row = Math.floor(lastMove / 3) + 1;
      const col = (lastMove % 3) + 1;
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = "Go to game start";
    }
    return (
      <tr key={move}>
        <td>
          <li>
            {move === currentMove ? (
              <span>
                {move === 0
                  ? "You are at game start"
                  : (() => {
                      const lm = entry.lastMove;
                      const row = Math.floor(lm / 3) + 1;
                      const col = (lm % 3) + 1;
                      return `You are at move #${move} (${row}, ${col})`;
                    })()}
              </span>
            ) : (
              <button onClick={() => jumpTo(move)}>{description}</button>
            )}
          </li>
        </td>
      </tr>
    );
  });

  const displayedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <>
      <div className="game">
        <div className="panels">
          <div className="left-panel">
            <Names
              setPlayer1={setPlayer1}
              setPlayer2={setPlayer2}
              player1={player1}
              player2={player2}
            />
            <div className="game-board">
              <Board
                xIsNext={xIsNext}
                squares={currentSquares}
                onPlay={handlePlay}
                player1={player1}
                player2={player2}
              />
            </div>
            <div className="game-info">
              <button
                className="reset-btn btn"
                onClick={resetGame}
                disabled={currentMove === 0 && history.length === 1}
                title="Reset the board and start a new game"
              >
                Reset Game
              </button>
              <button
                className={isAscending ? "asc-btn btn" : "desc-btn btn"}
                onClick={handleSorting}
                title={
                  isAscending
                    ? "Sort moves to show latest first"
                    : "Sort moves to show oldest first"
                }
              >
                {isAscending
                  ? "Sort Moves in Descending ⬆"
                  : "Sort Moves in Ascending ⬇"}
              </button>
            </div>
          </div>
          <div className="right-panel">
            <HistoryTable displayedMoves={displayedMoves} />
          </div>
        </div>
      </div>
    </>
  );
}

function HistoryTable({ displayedMoves }) {
  return (
    <div className="table-card">
      <h2 className="history-title">Move History</h2>
      <table className="history-table" aria-label="Move history">
        <tbody>{displayedMoves}</tbody>
      </table>
    </div>
  );
}

function Board({ xIsNext, squares, onPlay, player1, player2 }) {
  const winner = calculateWinner(squares);
  const winningLine = winner ? winner.line : [];
  let status;
  if (winner) {
    status =
      winner.winner == "X"
        ? player1
          ? player1
          : "Player 1"
        : player2
        ? player2
        : "Player 2";
  } else if (squares.every((sq) => sq !== null)) {
    status = "Draw";
  } else {
    status = xIsNext
      ? player1
        ? player1
        : "Player 1"
      : player2
      ? player2
      : "Player 2";
  }

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) return;
    const nextSquares = squares.slice();
    xIsNext ? (nextSquares[i] = "X") : (nextSquares[i] = "O");
    onPlay(nextSquares, i);
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      squaresInRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinningSquare={winningLine.includes(index)}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  let statusClass = "";
  if (winner) {
    statusClass = winner.winner === "X" ? "x-color" : "o-color";
  } else if (status === "Draw") {
    statusClass = "draw-color";
  } else {
    statusClass = xIsNext ? "x-color" : "o-color";
  }

  return (
    <>
      <div className="status">
        {winner
          ? "Winner: "
          : status === "Draw"
          ? "Result is: "
          : "Next player: "}
        <span className={statusClass}>{status}</span>
      </div>
      {boardRows}
    </>
  );
}

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={`square ${isWinningSquare ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value === "X" ? (
        <span className="x-color">X</span>
      ) : value === "O" ? (
        <span className="o-color">O</span>
      ) : null}
    </button>
  );
}

function calculateWinner(squares) {
  if (!Array.isArray(squares)) return null;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return { winner: squares[a], line: [a, b, c] };
  }
  return null;
}

function Header() {
  return <h1 className="header">Tic-Tac-Toe</h1>;
}

function Footer() {
  return (
    <footer>
      <div>Made By Kareem Kadrey ©2025 . All rights reserved</div>
    </footer>
  );
}

function Names({ player1, player2, setPlayer1, setPlayer2 }) {
  function handleName1(e) {
    setPlayer1(e.target.value);
  }

  function handleName2(e) {
    setPlayer2(e.target.value);
  }

  return (
    <>
      <div className="pl1">
        <label htmlFor="in1">
          <span className="x-color">Player 1 Name (X)</span>
        </label>
        <input
          id="in1"
          type="text"
          placeholder="Enter Name of Player 1"
          onChange={(e) => handleName1(e)}
          value={player1}
        ></input>
      </div>

      <div className="pl2">
        <label htmlFor="in2">
          <span className="o-color">Player 2 Name (O)</span>
        </label>
        <input
          id="in2"
          type="text"
          placeholder="Enter Name of Player 2"
          onChange={(e) => handleName2(e)}
          value={player2}
        ></input>
      </div>
    </>
  );
}
