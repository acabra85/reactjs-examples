import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const _rows = 3;
const _cols = 3;
const _winnerLines3x3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const _winnerLines3x4 = [
  /*
  [0, 1,  2,  3],
  [4, 5,  6,  7],
  [8, 9, 10, 11],
  */
  //ver
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
  //hor
  [0, 1, 2],
  [1, 2, 3],
  [4, 5, 6],
  [5, 6, 7],
  [8, 9, 10],
  [9, 10, 11],
  //diag
  [0, 5, 10],
  [1, 6, 11],
  [3, 6, 9],
  [2, 5, 8],
];

const _winnerLines4x3 = [
  /*
  [0,  1,  2],
  [3,  4,  5],
  [6,  7,  8],
  [9, 10, 11],
  */
  //hor
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  //ver
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [4, 7, 10],
  [5, 8, 11],
  //diag
  [0, 4, 8],
  [2, 4, 6],
  [3, 7, 11],
  [5, 7, 9],
];

const _winnerLines4x4 = [
  /*
  [ 0,  1,  2,  3],
  [ 4,  5,  6,  7],
  [ 8,  9, 10, 11],
  [12, 13, 14, 15],
  */
  //hor
  [0, 1, 2],
  [1, 2, 3],
  [4, 5, 6],
  [5, 6, 7],
  [8, 9, 10],
  [9, 10, 11],
  [12, 13, 14],
  [13, 14, 15],

  //ver
  [0, 4, 8],
  [4, 8, 12],
  [1, 5, 9],
  [5, 9, 13],
  [2, 6, 10],
  [6, 10, 14],
  [3, 7, 11],
  [7, 11, 15],

  //diag
  [0, 5, 10],
  [5, 10, 15],
  [3, 6, 9],
  [6, 9, 12],
  [1, 6, 11],
  [4, 9, 14],
  [2, 5, 8],
  [7, 10, 13],
];

const winnerMaps = new Map();
winnerMaps.set("3x3", _winnerLines3x3);
winnerMaps.set("3x4", _winnerLines3x4);
winnerMaps.set("4x3", _winnerLines4x3);
winnerMaps.set("4x4", _winnerLines4x4);

const buildNewState = (rows, cols, winnerLines) => {
  return {
    history: [newMove(rows, cols)],
    boardId: 0,
    sortAscending: true,
    cols: cols,
    rows: rows,
    winnerLines: winnerLines,
  }
};

function getWinnerLinesBoard(rows, cols) {
  const key = rows + "x" + cols;
  if(winnerMaps.has(key)) {
    return winnerMaps.get(key);
  }
  console.log('no config found: ' + key);
  return null;
}

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
    const rows = _ref.props.rowsMap.map((v,i) => { 
      return <div key={i} className="board-row">
        {_ref.props.colsMap.map((el, idx) => _ref.renderSquare(i*_ref.props.cols + idx))}
      </div>
    });
    return (
      <div>
        {rows}
      </div>
    );
  }
}

const newMove = (cols, rows) => {
  return {
    squares: Array(cols*rows).fill(null),
    id: 0,
    move: null,
    gameOver: false,
    turnX: true,
  };
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    const winnerLines = getWinnerLinesBoard(_rows, _cols);
    this.state = buildNewState(_rows, _cols, winnerLines);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.isWinnerLine = this.isWinnerLine.bind(this);
    this.translateMove = this.translateMove.bind(this);
    this.toggleAscending = this.toggleAscending.bind(this);
    this.changeCols = this.changeCols.bind(this);
    this.changeRows = this.changeRows.bind(this);
    this.goTo = this.goTo.bind(this);
    this.restart = this.restart.bind(this);
  }

  changeRows(e) {
    const rows = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(rows, this.state.cols);
    if(winnerLines) {
      this.setState(buildNewState(rows, this.state.cols, winnerLines));
    }
  }

  changeCols(e) {
    const cols = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(this.state.rows, cols);
    if(winnerLines) {
      this.setState(buildNewState(this.state.rows, cols, winnerLines));
    }
  }
  
  restart() {
    const winnerLines = getWinnerLinesBoard(this.state.rows, this.state.cols);
    this.setState(buildNewState(this.state.rows, this.state.cols, winnerLines));
  }
  
  goTo(id) {
    this.setState({
      boardId: id,
    });
  }
  
  toggleAscending(e) {
    const toggleVal = !this.state.sortAscending;
    this.setState({
      sortAscending: toggleVal,
    });
  }
  
  isWinnerLine(sq, line) {
    if(sq[line[0]]) {
      for(let i=1;i < line.length;++i) {
        if(sq[line[i-1]] !== sq[line[i]]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  
  getWinnerLine(sq) {
    for(let i=0;i<this.state.winnerLines.length; ++i) {
      const wLine = this.state.winnerLines[i];
      if(this.isWinnerLine(sq, wLine)) {
        return wLine;
      }
    }
    return null;
  }

  translateMove(id) {
    return `${Math.floor(id/this.state.cols)},${id%this.state.cols}`;
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
    const _ref = this;
    this.setState({
      history: this.state.history.concat([{
        squares: squares,
        id: (current.id + 1),
        move: _translatedMove,
        winnerLine: winnerLine,
        turnX: !current.turnX,
        gameOver: winnerLine !== null || current.id + 1 === _ref.state.cols * _ref.state.rows,
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

    const rowsMap = Array(this.state.rows).fill(null);
    const colsMap = Array(this.state.cols).fill(null);
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            winner={current.winnerLine} 
            squares={current.squares} 
            cols={this.state.cols}
            colsMap={colsMap}
            rowsMap={rowsMap}
            onClick={(i) => this.handleSquareClick(i)} />
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
          <div>
            <label htmlFor='size-rows'>R:</label>
            <input name="size-rows" type="number" max={5} min={3} onChange={this.changeRows} value={this.state.rows} />
            <label htmlFor='size-cols'>C:</label>
            <input name="size-cols" type="number" max={5} min={3} onChange={this.changeCols} value={this.state.cols} />
          </div>
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

