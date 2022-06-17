import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { getWinnerLinesBoard } from './solutions';
import { _strikeLen, _rows, _cols, MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS, MIN_STRIKE_LEN } from "./constants.js";


function Square(props) {
  return (
      <button className={'square ' + props.compClassName} onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  renderSquare(i) {
    const cell = this.props.squares[i];
    return <Square 
             key={i}
             value={cell.val}
             compClassName={cell.cellClass}
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

const newCounter = () => {
  return {
    x: 0,
    o: 0,
    increment(c){
      if(c === 'X') {
        ++this.x;
      } else {
        ++this.o;
      }
    },
    winner() {
      return this.x > this.o ? 'X' : this.x < this.o ? 'O' : null;
    },
    draw(){
      return this.o === this.x;
    },
    clone() {
      const other = newCounter();
      other.x = this.x;
      other.o = this.o;
      return other;
    }
  };
};

const newCell = () => {
  return {
    cellClass: '', 
    val: null,
    awards: [false, false, false, false], //see LINE_DIR in constants.js
    equals(o) {
      return this.val === o?.val;
    },
    isSet() {
      return this.val !== null;
    },
    set(isPlayerX) {
      this.val = isPlayerX ? 'X' : 'O';
    },
    award(direction) {
      this.cellClass = (this.val === 'X') ? 'player-x-cell' : 'player-o-cell';
      this.awards[direction] = true;
    },
    clone() {
      const other = newCell();
      other.cellClass = this.cellClass;
      other.val = this.val;
      other.awards = this.awards.slice();
      return other;
    },
    isAwarded(direction) {
      return this.awards[direction];
    },
  };
};

const newMove = (cols, rows) => {
  return {
    squares: Array(cols*rows).fill(null).map((v, i) => {
      return newCell();
    }),
    id: 0,
    move: null,
    gameOver: false,
    turnX: true,
    counter: newCounter(),
  };
};
  
const buildNewState = (rows, cols, winnerLines, strikeLen, sortAscending) => {
  return {
    history: [newMove(rows, cols)],
    boardId: 0,
    sortAscending: sortAscending,
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
    this.state = buildNewState(_rows, _cols, winnerLines, _strikeLen, true);
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
      this.setState(buildNewState(this.state.rows, this.state.cols, winnerLines, strikeLen, this.state.sortAscending));
    }
  }

  changeRows(e) {
    const rows = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(rows, this.state.cols, this.state.strikeLen);
    if(winnerLines) {
      this.setState(buildNewState(rows, this.state.cols, winnerLines, this.state.strikeLen, this.state.sortAscending));
    }
  }

  changeCols(e) {
    const cols = parseInt(e.target.value);
    const winnerLines = getWinnerLinesBoard(this.state.rows, cols, this.state.strikeLen);
    if(winnerLines) {
      this.setState(buildNewState(this.state.rows, cols, winnerLines, this.state.strikeLen, this.state.sortAscending));
    }
  }
  
  restart() {
    const winnerLines = getWinnerLinesBoard(this.state.rows, this.state.cols, this.state.strikeLen);
    this.setState(buildNewState(this.state.rows, this.state.cols, winnerLines, this.state.strikeLen, this.state.sortAscending));
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
  
  /**
   * A line is consider winner if:
   *    1. None of the cells corresponding to the line have been awarded for the same direction
   * 
   * 
   * @param {[cell]} sq 
   * @param {[]} line 
   * @returns true if the given line corresponds a winner line 
   */
  isWinnerLine(sq, line) {
    if(sq[line[0]].isSet()) {
      for(let i=1;i < line.length;++i) {
        if(!sq[line[i-1]].equals(sq[line[i]])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  
  getScoreCount(sq, counter) {
    for(let i=0;i<this.state.winnerLines.length; ++i) {
      const wLine = this.state.winnerLines[i];
      if(this.isWinnerLine(sq, wLine.val)) {
        if(wLine.val.map(cell => sq[cell].isAwarded(wLine.dir) ? 1 : 0).reduce((prev, cur) => prev + cur, 0) === 0) {
          wLine.val.map((v, i) => sq[v].award(wLine.dir));
          counter.increment(sq[wLine.val[0]].val);
        }
      }
    }
    return counter;
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
    
    if(current.gameOver || current.squares[id].val) {
      console.log('no more moves');
      return;
    }
    const squares = current.squares.map((v,i) => v.clone());
    squares[id].set(current.turnX);
    const scoreCounter = this.getScoreCount(squares, current.counter.clone());
    const _translatedMove = this.translateMove(id);
    const _ref = this;
    this.setState({
      history: this.state.history.concat([{
        squares: squares,
        id: (current.id + 1),
        move: _translatedMove,
        counter: scoreCounter,
        turnX: !current.turnX,
        gameOver: current.id + 1 === _ref.state.cols * _ref.state.rows,
      }]),
      boardId: current.id + 1,
    });
  }
  
  render() {
    const current = this.state.history[this.state.boardId];
    const scoreLabel = `X: [${current.counter.x}] O: [${current.counter.o}]`;
    const turnLabel = !current.gameOver ? 'Next player: ' + (current.id % 2 === 0 ? 'X' : 'O') : '';
    const resultLabel = current.gameOver && current.counter.draw() ? 'Game Over Draw !!!' : 'The winner is: ' + current.counter.winner() + '!!!';
    const statusLabel = current.gameOver ? resultLabel : turnLabel;
    const buttons = {
      next: current.id + 1 < this.state.history.length,
      prev: current.id - 1 >= 0,
    };
    const moves = this.state.history.map((h, idx) => {
      const curHistItem = current.id === h.id;
      const player = (h.id % 2) !== 0 ? 'X' : 'O';
      const gotoLabel = h.id === 0 ? "Start" : `${player} moved [${h.move}]`;
      const buttonClass = curHistItem ? "current-button-move" : "";
      return <li key={idx} className={buttonClass}>
        <button onClick={() => this.goTo(h.id)} className={buttonClass} disabled={curHistItem}>{gotoLabel}</button>
      </li>;
    });

    const rowsMap = Array(this.state.rows).fill(null);
    const colsMap = Array(this.state.cols).fill(null);
    return (
      <div className="game">
        <div className="game-info">
          <div>{scoreLabel}</div>
          <div className={!current.gameOver  ? "game-next-move" : (current.counter.draw() ? "game-result-draw" : "game-result-winner") }>{statusLabel}</div>
        </div>
        <div className="game-board">
          <Board 
            winner={current.winnerLine} 
            squares={current.squares} 
            cols={this.state.cols}
            colsMap={colsMap}
            rowsMap={rowsMap}
            onClick={(i) => this.handleSquareClick(i)} />
          <div className='game-settings'>
            <label htmlFor='strike-len'>Strike</label>
            <input name="strike-len" type="number" max={Math.max(MAX_ROWS, MAX_COLS)} min={MIN_STRIKE_LEN} onChange={this.changeStrikeLen} value={this.state.strikeLen} />
            <label htmlFor='size-rows'>R:</label>
            <input name="size-rows" type="number" max={MAX_ROWS} min={MIN_ROWS} onChange={this.changeRows} value={this.state.rows} />
            <label htmlFor='size-cols'>C:</label>
            <input name="size-cols" type="number" max={MAX_COLS} min={MIN_COLS} onChange={this.changeCols} value={this.state.cols} />
            <button onClick={this.restart} disabled={this.state.history.length === 1}>Restart</button>
          </div>
        </div>
        <div className="game-info">
          <div>
            <label htmlFor="toggle-sorting">{this.state.sortAscending ? 'Ascending': 'Descending'}</label>
            <input name="toggle-sorting" type="checkbox" 
              onClick={this.toggleAscending} 
              checked={this.state.sortAscending}
              onChange={e => {}}/>
            <button disabled={!buttons.prev} onClick={() => this.goTo(current.id - 1)}>{'<<'}</button>
            <button disabled={!buttons.next} onClick={() => this.goTo(current.id + 1)}>{'>>'}</button>
          </div>
          <div className='time-machine'>
            <ol 
              reversed={!this.state.sortAscending} 
              start={this.state.sortAscending ? '0' : this.state.history.length - 1}>
                {this.state.sortAscending ? moves :  moves.reverse()}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

