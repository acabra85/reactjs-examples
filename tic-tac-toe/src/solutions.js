import { MAX_COLS, MIN_COLS, MAX_ROWS, MIN_ROWS } from "./constants.js";

  const solutionsMap = new Map();
  const invalidCellError = new Error();

  const to1D = (i, j, rows, cols) => {
    if(i>=0 && i<rows && j>=0 && j<cols) {
      return cols*i + j;
    }
    throw invalidCellError;
  };

  const up = (i, j, rows, cols) => {
    let a = to1D(i-2, j, rows, cols);
    let b = to1D(i-1, j, rows, cols);
    let c = to1D(i, j, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const left= (i, j, rows, cols) => {
    let a = to1D(i, j-2, rows, cols);
    let b = to1D(i, j-1, rows, cols);
    let c = to1D(i, j, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const right= (i, j, rows, cols) => {
    let a = to1D(i, j, rows, cols);
    let b = to1D(i, j+1, rows, cols);
    let c = to1D(i, j+2, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const down = (i, j, rows, cols) => {
    let a = to1D(i, j, rows, cols);
    let b = to1D(i+1, j, rows, cols);
    let c = to1D(i+2, j, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const upLeft = (i, j, rows, cols) => {
    let a = to1D(i-2, j-2, rows, cols);
    let b = to1D(i-1, j-1, rows, cols);
    let c = to1D(i, j, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const upRight = (i, j, rows, cols) => {
    let a = to1D(i-2, j+2, rows, cols);
    let b = to1D(i-1, j+1, rows, cols);
    let c = to1D(i, j, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const downRight = (i, j, rows, cols) => {
    let a = to1D(i, j, rows, cols);
    let b = to1D(i+1, j+1, rows, cols);
    let c = to1D(i+2, j+2, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
  };

  const downLeft = (i, j, rows, cols) => {
    let a = to1D(i, j, rows, cols);
    let b = to1D(i+1, j-1, rows, cols);
    let c = to1D(i+2, j-2, rows, cols);
    return {key: a+';'+b+';'+c, val: [a, b, c] };
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
                if(validArr(res.val, rows*cols) && !set.has(res.key)) {
                    set.add(res.key)
                    winnerLines.push(res.val);
                }
            } catch(e) {}
        });
      }
    }
    return winnerLines;
  };
  
 export const getWinnerLinesBoard = (rows, cols) => {
    if(rows < MIN_ROWS || rows > MAX_ROWS || cols < MIN_COLS || cols > MAX_COLS) {
      console.log('invalid dimensions');
      return null;
    }
    const key = rows + "x" + cols;
    if(solutionsMap.has(key)) {
      return solutionsMap.get(key);
    }
    const winnerLines = buildWinnerLines(rows, cols);
    solutionsMap.set(key, winnerLines);
    return winnerLines;
  };
