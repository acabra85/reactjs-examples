function Square(props) {
  return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  
  renderSquare(i) {
    return <Square 
             value={this.props.squares[i]}
             onClick={() => this.props.onClick(i)}
             />;
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
          squares: Array(9).fill(null),
          id: 0,
      }],
      turnX: true,
      winner: null,
      gameOver: false,
      boardId: 0,
    };
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.validateState = this.validateState.bind(this);
    this.isWinnerLine = this.isWinnerLine.bind(this);
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
      history: [{
          squares: Array(9).fill(null),
          id: 0,
      }],
      turnX: true,
      winner: null,
      gameOver: false,
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
    if(sq[a] && sq[a] === sq[b] && sq[b] === sq[c]) return sq[c];
    return null;
  }
  
  validateState() {
    const sq = this.state.history[this.state.history.length - 1].squares;
    for(let i=0;i<this.winnerLines.length; ++i) {
      const wLine = this.winnerLines[i];
      const winner = this.isWinnerLine(sq, wLine);
      if(winner) {
        this.setState({
          gameOver: true,
          winner: winner
        });
        return;
      }
    }
  }
  
  handleSquareClick(id) {
    if(this.state.boardId !== this.state.history.length-1) {
      console.log("cant modify board");
      return;
    }
    const current = this.state.history[this.state.history.length - 1];
    
    if(this.state.gameOver || current.squares[id]) {
      console.log('no more moves');
      return;
    }
    
    const nextTurn = !this.state.turnX;
    const squares = current.squares.slice();
    squares[id] = this.state.turnX ? 'X': 'O';
    this.setState({
      history: this.state.history.concat([{
        squares: squares,
        id: (current.id + 1),
      }]),
      turnX: nextTurn,
      boardId: current.id + 1,
    }, this.validateState);    
  }
  
  render() {
    const current = this.state.history[this.state.boardId];
    const status = 'Next player: ' + (this.state.gameOver ? '' : (current.id % 2 === 0 ? 'X' : 'O'));
    const winner = this.state.winner ? 'The winner is: ' + this.state.winner + '!!!': '';
    const buttons = {
      next: current.id + 1 < this.state.history.length ,
      prev: current.id - 1 >= 0,
    };
    const moves = this.state.history.map((h) => {
      
      const gotoLabel = h.id == 0 ? "Start" : `Move #${h.id+1}`
      return <li key={h.id}>
        <button onClick={() => this.goTo(h.id)}>Go to {gotoLabel}</button>
      </li>;
    });
    return (
      <div className="game">
        <div className="game-board">
          <Board status={status} winner={winner} squares={current.squares} onClick={(i) => this.handleSquareClick(i)} />
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

