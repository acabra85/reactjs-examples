import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { getWinnerLinesBoard } from './solutions';
import { _strikeLen, _rows, _cols, MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS } from "./constants.js";


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
  
const buildNewState = (rows, cols, winnerLines, strikeLen) => {
  return {
    history: [newMove(rows, cols)],
    boardId: 0,
    sortAscending: true,
    cols: cols,
    rows: rows,
    strikeLen: Math.min(Math.min(rows, cols),strikeLen),
    winnerLines: winnerLines,
  }
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    const winnerLines = getWinnerLinesBoard(_rows, _cols, _strikeLen);
    this.state = buildNewState(_rows, _cols, winnerLines, _strikeLen);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.isWinnerLine = this.isWinnerLine.bind(this);
    this.translateMove = this.translateMove.bind(this);
    this.toggleAscending = this.toggleAscending.bind(this);
    this.changeCols = this.changeCols.bind(this);
    this.changeStrikeLen = this.changeStrikeLen.bind(this);
    this.changeRows = this.changeRows.bind(this);
    this.goTo = this.goTo.bind(this);
    this.restart = this.restart.bind(this);
  }

  changeStrikeLen(e) {
    const strikeLen = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(this.state.rows, this.state.cols, strikeLen);
    if(winnerLines) {
      this.setState(buildNewState(this.state.rows, this.state.cols, winnerLines, strikeLen));
    }
  }

  changeRows(e) {
    const rows = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(rows, this.state.cols, this.state.strikeLen);
    if(winnerLines) {
      this.setState(buildNewState(rows, this.state.cols, winnerLines, this.state.strikeLen));
    }
  }

  changeCols(e) {
    const cols = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(this.state.rows, cols, this.state.strikeLen);
    if(winnerLines) {
      this.setState(buildNewState(this.state.rows, cols, winnerLines, this.state.strikeLen));
    }
  }
  
  restart() {
    const winnerLines = getWinnerLinesBoard(this.state.rows, this.state.cols, this.state.strikeLen);
    this.setState(buildNewState(this.state.rows, this.state.cols, winnerLines, this.state.strikeLen));
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
          <div className='game-settings'>
            <label htmlFor='strike-len'>Strike</label>
            <input name="strike-len" type="number" max={Math.max(MAX_ROWS, MAX_COLS)} min={Math.min(MIN_ROWS, MIN_COLS)} onChange={this.changeStrikeLen} value={this.state.strikeLen} />
            <label htmlFor='size-rows'>R:</label>
            <input name="size-rows" type="number" max={MAX_ROWS} min={MIN_ROWS} onChange={this.changeRows} value={this.state.rows} />
            <label htmlFor='size-cols'>C:</label>
            <input name="size-cols" type="number" max={MAX_COLS} min={MIN_COLS} onChange={this.changeCols} value={this.state.cols} />
          </div>
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
            <button onClick={this.restart}>Restart</button>
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

