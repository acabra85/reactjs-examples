import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const _rows = 3;
const _cols = 3;

const SIZE = {
  rows: _rows,
  cols: _cols,
  moves: _rows * _cols,
  rowsMap: Array(_rows).fill(null),
  colsMap: Array(_cols).fill(null),
};

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
            key={i}
             value={this.props.squares[i]}
             winner={isWinner}
             onClick={() => this.props.onClick(i)}
             />;
  }

  render() {
    const _ref = this;
    const rows = SIZE.rowsMap.map((v,i) => { 
      return <div key={i} className="board-row">
        {SIZE.colsMap.map((el, idx) => _ref.renderSquare(i*SIZE.cols + idx))}
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
    squares: Array(SIZE.moves).fill(null),
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
      sortAscending: true,
    };
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.isWinnerLine = this.isWinnerLine.bind(this);
    this.translateMove = this.translateMove.bind(this);
    this.toggleAscending = this.toggleAscending.bind(this);
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
  
  toggleAscending(e) {
    const toggleVal = !this.state.sortAscending;
    this.setState({
      sortAscending: toggleVal,
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
    console.log(id);
    return `${Math.floor(id/SIZE.cols)},${id%SIZE.cols}`;
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
    const squares = current.squares.slice();
    squares[id] = current.turnX ? 'X': 'O';
    const winnerLine = this.getWinnerLine(squares)
    const _translatedMove = this.translateMove(id);
    this.setState({
      history: this.state.history.concat([{
        squares: squares,
        id: (current.id + 1),
        move: _translatedMove,
        winnerLine: winnerLine,
        turnX: !current.turnX,
        gameOver: winnerLine !== null || current.id + 1 === SIZE.moves,
      }]),
      boardId: current.id + 1,
    });
  }
  
  render() {
    const current = this.state.history[this.state.boardId];
    const turnLabel = current.gameOver ? 'Game Over: Draw!!' : 'Next player: ' + (current.id % 2 === 0 ? 'X' : 'O');
    const winnerLabel = current.winnerLine ? 'The winner is: ' + current.squares[current.winnerLine[0]] + '!!!': '';
    const statusLabel = current.gameOver && current.winnerLine ? winnerLabel : turnLabel;
    const buttons = {
      next: current.id + 1 < this.state.history.length,
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
          <Board winner={current.winnerLine} squares={current.squares} onClick={(i) => this.handleSquareClick(i)} />
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
          <div className={current.winnerLine ? "game-result-winner" : (current.gameOver ? "game-result-draw" : "game-next-move")}>{statusLabel}</div>
          <div>
            <label htmlFor="toggle-sorting">{this.state.sortAscending ? 'Ascending': 'Descending'}</label>
            <input name="toggle-sorting" type="checkbox" 
              onClick={this.toggleAscending} 
              checked={this.state.sortAscending}
              onChange={e => {}}/>
          </div>
          <ol 
            reversed={!this.state.sortAscending} 
            start={this.state.sortAscending ? '0' : this.state.history.length - 1}>{this.state.sortAscending ? moves :  moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

