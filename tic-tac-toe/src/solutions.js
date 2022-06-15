import { MAX_COLS, MIN_COLS, MAX_ROWS, MIN_ROWS } from "./constants.js";

  const solutionsMap = new Map();
  const invalidCellError = new Error();
  const strikeMgr = {
      len: 3,
      update(val) {
          if(val< MIN_COLS || val < MIN_ROWS || val>MAX_COLS || val>MAX_ROWS) {
              return;
          }
          this.len = val;
      },
      get() {
          return this.len;
      }
  };

  const to1D = (i, j, rows, cols) => {
    if(i>=0 && i<rows && j>=0 && j<cols) {
      return cols*i + j;
    }
    throw invalidCellError;
  };

  const up = (i, j, rows, cols) => {
    /*
    let a = to1D(i-2, j, rows, cols);
    let b = to1D(i-1, j, rows, cols);
    let c = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get() - 1; k>=0;--k) {
      let elm = to1D(i-k, j, rows, cols);
      wLine.push(elm);
      key = key + elm + (k===0?'':';');
    }
    return {key: key, val: wLine };
  };

  const left= (i, j, rows, cols) => {
    /*
    let a = to1D(i, j-2, rows, cols);
    let b = to1D(i, j-1, rows, cols);
    let c = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get() - 1; k>=0;--k) {
      let elm = to1D(i, j-k, rows, cols);
      wLine.push(elm);
      key = key + elm + (k===0?'':';');
    }
    return {key: key, val: wLine };
  };

  const right= (i, j, rows, cols) => {
      /*
    let c = to1D(i, j+2, rows, cols);
    let b = to1D(i, j+1, rows, cols);
    let a = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i, j+k, rows, cols);
      wLine.unshift(elm);
      key = (k===0 ? '' : ';') + elm + key;
    }
    return {key: key, val: wLine};
  };

  const down = (i, j, rows, cols) => {
    /*
    let c = to1D(i+2, j, rows, cols);
    let b = to1D(i+1, j, rows, cols);
    let a = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i+k, j, rows, cols);
      wLine.unshift(elm);
      key = (k===0 ? '' : ';') + elm + key;
    }
    return {key: key, val: wLine};
  };

  const upLeft = (i, j, rows, cols) => {
      /*
    let a = to1D(i-2, j-2, rows, cols);
    let b = to1D(i-1, j-1, rows, cols);
    let c = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i-k, j-k, rows, cols);
      wLine.push(elm);
      key = key + elm + (k===0?'':';');
    }
    return {key: key, val: wLine};
  };

  const upRight = (i, j, rows, cols) => {
    /*
    let a = to1D(i-2, j+2, rows, cols);
    let b = to1D(i-1, j+1, rows, cols);
    let c = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i-k, j+k, rows, cols);
      wLine.push(elm);
      key = key + elm + (k===0?'':';');
    }
    return {key: key, val: wLine};
  };

  const downRight = (i, j, rows, cols) => {
      /*
    let c = to1D(i+2, j+2, rows, cols);
    let b = to1D(i+1, j+1, rows, cols);
    let a = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i+k, j+k, rows, cols);
      wLine.unshift(elm);
      key = (k===0 ? '' : ';') + elm + key;
    }
    return {key: key, val: wLine};
  };

  const downLeft = (i, j, rows, cols) => {
      /*
    let c = to1D(i+2, j-2, rows, cols);
    let b = to1D(i+1, j-1, rows, cols);
    let a = to1D(i, j, rows, cols);
    */
    let key = '';
    let wLine = [];
    for(let k=strikeMgr.get()-1; k>=0;--k) {
      let elm = to1D(i+k, j-k, rows, cols);
      wLine.unshift(elm);
      key = (k===0 ? '' : ';') + elm + key;
    }
    return {key: key, val: wLine};
  };
  
  const allFuns = [up, left, right, down, upLeft, downLeft, upRight, downRight];

  const validArr = (val, max) => {
      for(let i=0;i<val.length;++i) {
        if(val[i] < 0 || val[i] >= max) {
            return false;
        }
      }
      return true;
  };

  const buildWinnerLines = (rows, cols) => {
    let set = new Set();
    let winnerLines = [];
    for(let i = 0; i < rows; ++i) {
      for(let j = 0; j < cols; ++j) {
        allFuns.forEach(f => {
            try {
                const res = f(i, j, rows, cols);
                if(!set.has(res.key) && validArr(res.val, rows*cols)) {
                    set.add(res.key)
                    winnerLines.push(res.val);
                }
            } catch(e) {}
        });
      }
    }
    return winnerLines;
  };
  
 export const getWinnerLinesBoard = (rows, cols, iStrikeLen) => {
     const strikeLen = Math.min(iStrikeLen, Math.min(rows, cols));
    if(rows < MIN_ROWS || rows > MAX_ROWS || cols < MIN_COLS || cols > MAX_COLS 
        || (strikeLen < MIN_ROWS && strikeLen < MIN_COLS) || strikeLen > Math.min(rows,cols)) {
      console.log('invalid dimensions');
      return null;
    }
    strikeMgr.update(strikeLen);
    const key = rows + "x" + cols+"x"+strikeLen;
    if(solutionsMap.has(key)) {
      return solutionsMap.get(key);
    }
    const winnerLines = buildWinnerLines(rows, cols);
    solutionsMap.set(key, winnerLines);
    return winnerLines;
  };
