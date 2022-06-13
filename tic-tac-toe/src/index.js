import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  const class_name = !props.winner ? "square" : "square winner-cell"
  return (
      <button className={class_name} onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  renderSquare(i) {
    const isWinner = this.props.winner && this.props.winner.indexOf(i) >= 0;
    return <Square 
             value={this.props.squares[i]}
             winner={isWinner}
             onClick={() => this.props.onClick(i)}
             />;
  }

  render() {
    const _ref = this;
    const rows = Array(3).fill(null).map((v,i) => { 
      return <div key={i} className="board-row">
        {_ref.renderSquare(i*3)}
        {_ref.renderSquare(i*3 + 1)}
        {_ref.renderSquare(i*3 + 2)}
      </div>
    });
    return (
      <div>
        {rows}
      </div>
    );
  }
}

const newMove = () => {
  return {
    squares: Array(9).fill(null),
    id: 0,
    move: null,
    gameOver: false,
    turnX: true,
  };
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [newMove()],
      boardId: 0,
    };
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.isWinnerLine = this.isWinnerLine.bind(this);
    this.translateMove = this.translateMove.bind(this);
    this.goTo = this.goTo.bind(this);
    this.restart = this.restart.bind(this);
    this.winnerLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
  }
  
  restart() {
    this.setState({
      history: [newMove()],
      boardId: 0,
    });
  }
  
  goTo(id) {
    this.setState({
      boardId:id,
    });
  }
  
  isWinnerLine(sq, line) {
    const [a, b, c] = line;
    if(sq[a] && sq[a] === sq[b] && sq[b] === sq[c]) return true;
    return false;
  }
  
  getWinnerLine(sq) {
    for(let i=0;i<this.winnerLines.length; ++i) {
      const wLine = this.winnerLines[i];
      if(this.isWinnerLine(sq, wLine)) {
        return wLine;
      }
    }
    return null;
  }

  translateMove(id) {
    return `${Math.floor(id/3)},${id%3}`;
  }
  
  handleSquareClick(id) {
    if(this.state.boardId !== this.state.history.length-1) {
      console.log("cant modify board");
      return;
    }
    const current = this.state.history[this.state.history.length - 1];
    
    if(current.gameOver || current.squares[id]) {
      console.log('no more moves');
      return;
    }
    const _ref = this;
    const nextTurn = !current.turnX;
    const squares = current.squares.slice();
    squares[id] = current.turnX ? 'X': 'O';
    const winnerLine = _ref.getWinnerLine(squares)
    const _translatedMove = this.translateMove(id);
    this.setState({
      history: this.state.history.concat([{
        squares: squares,
        id: (current.id + 1),
        move: _translatedMove,
        winnerLine: _ref.getWinnerLine(squares),
        turnX: nextTurn,
        gameOver: winnerLine !== null,
      }]),
      boardId: current.id + 1,
    }, () => console.log('updated'));    
  }
  
  render() {
    const current = this.state.history[this.state.boardId];
    const status = 'Next player: ' + (current.gameOver ? '' : (current.id % 2 === 0 ? 'X' : 'O'));
    const winner = current.winnerLine ? 'The winner is: ' + current.squares[current.winnerLine[0]] + '!!!': '';
    const buttons = {
      next: current.id + 1 < this.state.history.length ,
      prev: current.id - 1 >= 0,
    };
    const moves = this.state.history.map((h, idx) => {
      const player = (h.id % 2) !== 0 ? 'X' : 'O';
      const gotoLabel = h.id === 0 ? "Start" : `${player} moved [${h.move}]`;
      const buttonClass = current.id === h.id ? "current-button-move" : "";
      return <li key={idx} className={buttonClass}>
        <button onClick={() => this.goTo(h.id)} className={buttonClass}>{gotoLabel}</button>
      </li>;
    });
    return (
      <div className="game">
        <div className="game-board">
          <Board status={status} winner={current.winnerLine} squares={current.squares} onClick={(i) => this.handleSquareClick(i)} />
          <div >
            <button disabled={!buttons.prev} onClick={() => this.goTo(current.id - 1)}>
              {'<<'}
            </button>
            <button disabled={!buttons.next} onClick={() => this.goTo(current.id + 1)}>
              {'>>'}
            </button>
          </div>
          <div>
            <button onClick={this.restart}>
              {'Restart'}
            </button>
          </div>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="game_result">{winner}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

