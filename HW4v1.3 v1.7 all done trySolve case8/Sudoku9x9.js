// Student name: Siyang Li
// Student ID: 11443579

// version 1.7

function SudokuCell(numPossibleValues)
{
    this.m_numList = new Array();
    if(numPossibleValues !== null || numPossibleValues !== undefined){
        for(var i = 1; i <= numPossibleValues; i++){
            this.m_numList.push(i);
        }
    }

    //isFinalized and finalizedValue
    //var isFinalized = new Object();
    Object.defineProperty(this, "isFinalized", {
        enumerable: true,
        get: function(){ return this.m_numList.length == 1 ? true : false; }
    })

    Object.defineProperty(this, "finalizedValue", {
        enumerable: true,
        //writable: true,
        get: function(){
            if(this.isFinalized === false) { return undefined; }
            else { return this.m_numList[0]; }
        },
        set: function(newValue){
            //this is statement is important! why?
            if(newValue == undefined){
                return;
            }
            this.m_numList = [];
            this.m_numList.push(newValue);
        }
    })
}

SudokuCell.prototype.containsPossibility = function(value)
{
    return this.m_numList.includes(value);
}

SudokuCell.prototype.getPossibilities = function()
{
    return this.m_numList.sort();
}

SudokuCell.prototype.removePossibility = function(value)
{
    if(this.isFinalized === true){
        return false;
    }
    if(this.m_numList.includes(value)){
        var index = this.m_numList.indexOf(value);
        if(index !== -1){
            this.m_numList.splice(index, 1);
        }
        return true;
    }
    else{
        return false;
    }
}

SudokuCell.prototype.removePossibilities = function(arrOfValues)
{
    for(var i = 0; i < arrOfValues.length; i++){
        this.removePossibility(arrOfValues[i]);
    }
}

SudokuCell.prototype.toString = function()
{
    var temp = this.getPossibilities();
    var s = "";
    for(var i = 0; i < temp.length; i++){
        s += temp[i];
    }
    return s;
}











function SudokuCellCollection(arrOfCells)
{
    if(arrOfCells === null || arrOfCells === undefined){
        return false;
    }

    this.m_cellCollection = new Array();

    for(var i = 0;i < arrOfCells.length; i++){
        var tmp = new SudokuCell();
        tmp.m_numList = arrOfCells[i].m_numList;
        tmp.isFinalized = arrOfCells[i].isFinalized;
        tmp.finalizedValue = arrOfCells[i].finalizedValue;
        this.m_cellCollection.push(tmp);
    }

    Object.defineProperty(this, "length", {
        get: function(){ return this.m_cellCollection.length; }
    })


    Object.seal(this.m_cellCollection);
}

SudokuCellCollection.prototype.containsCell = function(cell)
{
    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].isFinalized == cell.isFinalized
            && this.m_cellCollection[i].finalizedValue == cell.isFinalized
            && this.m_cellCollection[i].m_numList.sort().toString() == cell.m_numList.sort().toString()){
                return true;
            }
    }
    return false;
}

SudokuCellCollection.prototype.containsPossibility = function(value)
{
    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].containsPossibility(value)){
            return true;
        }
    }
    return false;
}
//is it implemented correctly?
SudokuCellCollection.prototype.count = function(predicate)
{
    var result = 0;
    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(predicate(this.m_cellCollection[i]) == true){
            result++;
        }
    }
    return result;
}

SudokuCellCollection.prototype.forEach = function(functionThatTakes1CellParam, startIndex)
{
    if(startIndex === null || startIndex === undefined){
        startIndex = 0;
    }

    for(var i = startIndex; i < this.m_cellCollection.length; i++){
        functionThatTakes1CellParam(this.m_cellCollection[i]);
    }
}

SudokuCellCollection.prototype.getFinalizedValues = function()
{
    var arr = new Array();

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].isFinalized == true){
            arr.push(this.m_cellCollection[i].finalizedValue);
        }
    }
    return arr;
}

SudokuCellCollection.prototype.getPossibilities = function()
{
    var arr = new Array();

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].isFinalized == false){
            for(var value of this.m_cellCollection[i].getPossibilities()){
                if(arr.includes(value) == false){
                    arr.push(value);
                }
            }
        }
    }
    arr.sort();

    return arr;
}

SudokuCellCollection.prototype.removeCell = function(cell)
{
    var arr = new Array();

    for(var i = 0;i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].m_numList.toString() != cell.m_numList.toString())
        {
            arr.push(this.m_cellCollection[i]);
        }
    }

    var collection = new SudokuCellCollection(arr);

    return collection;
}

SudokuCellCollection.prototype.removeCells = function(otherCellCollection)
{
    for(var i = 0; i < otherCellCollection.m_cellCollection.length; i++){
        var collection = new SudokuCellCollection();
        collection = this.removeCell(otherCellCollection.m_cellCollection[i]);
    }
    return collection;
}

SudokuCellCollection.prototype.removePossibility = function(value)
{
    var num = 0;
    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].removePossibility(value) == true)
        {
            num++;
        }
    }
    return num;
}













function SudokuCellBlock(arrOf9Cells)
{
    SudokuCellCollection.call(this, arrOf9Cells);
}
SudokuCellBlock.prototype = Object.create(SudokuCellCollection.prototype);

// Assuming: eliminating possibilities that already finalized in other cells
SudokuCellBlock.prototype.trySolve = function()
{
    var resultObj = new Object();
    resultObj.changed = false;
    resultObj.solved = false;

    // push all the finalizedValue into an array
    var finalizedArray = new Array();

    var unfinalizedDict = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(this.m_cellCollection[i].isFinalized == true){
            finalizedArray.push(this.m_cellCollection[i].finalizedValue);
        }
        else{
            //store the frequency of unfinalized cell's numlist
            for(var value of this.m_cellCollection[i].m_numList){
                unfinalizedDict[value]++;
            }
        }
    }

    // now we have an array of finalizedValue
    // iterate through the array, eliminate finalizedValue within unfinalized cell
    for(var j = 0; j < finalizedArray.length; j++){
        var num = this.removePossibility(finalizedArray[j]);
        if(num > 0){
            resultObj.changed = true;
        }
    }

    // index here is the corresponding possibilities
    for(var index in unfinalizedDict){
        if(unfinalizedDict[index] == 1){
            for(var cell of this.m_cellCollection){
                if(cell.m_numList.includes(parseInt(index)) == true){
                    cell.finalizedValue = parseInt(index);
                }
            }
        }
    }



    if(finalizedArray.length == 8){
        for(var i = 0; i < this.m_cellCollection.length; i++){
            this.m_cellCollection[i].isFinalized = true;
            this.m_cellCollection[i].finalizedValue = this.m_cellCollection[i].m_numList[0];
        }
        resultObj.solved = true;
    }
    if(finalizedArray.length == 9){
        resultObj.solved = true;
    }

    return resultObj;
}













function Sudoku3x3Block(arrOf9Cells)
{
    SudokuCellBlock.call(this, arrOf9Cells);
}
Sudoku3x3Block.prototype = Object.create(SudokuCellBlock.prototype);

Sudoku3x3Block.prototype.getPossibilitiesOnlyAvailableOnColumn = function(colIndex)
{
    var tmpArr = new Array();
    var resultArr = new Array();

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(i % 3 == colIndex){
            tmpArr = this.m_cellCollection[i].getPossibilities();
            for(var value of tmpArr){
                if(resultArr.includes(value) == false){
                    resultArr.push(value);
                }
            }
        }
    }
    return resultArr;
}

Sudoku3x3Block.prototype.getPossibilitiesOnlyAvailableOnRow = function(colIndex)
{
    var tmpArr = new Array();
    var resultArr = new Array();

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(Math.floor(i / 3) == colIndex){
            tmpArr = this.m_cellCollection[i].getPossibilities();
            for(var value of tmpArr){
                if(resultArr.includes(value) == false){
                    resultArr.push(value);
                }
            }
        }
    }
    return resultArr;
}

Sudoku3x3Block.prototype.isColumnFinalized = function(columnIndex)
{
    var check = true;

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(i % 3 == columnIndex){
            if(this.m_cellCollection[i].isFinalized == false){
                check = false;
                break;
            }
        }
    }
    return check;
}

Sudoku3x3Block.prototype.isRowFinalized = function(rowIndex)
{
    var check = true;

    for(var i = 0; i < this.m_cellCollection.length; i++){
        if(Math.floor(i / 3) == rowIndex){
            if(this.m_cellCollection[i].isFinalized == false){
                check = false;
                break;
            }
        }
    }
    return check;
}
//optional
Sudoku3x3Block.prototype.toString = function()
{

}














function Sudoku9x9(arrOf81Values)
{
    //Assuming arrOf81Values is garantee to be 81 values?
    if(arrOf81Values === null || arrOf81Values === undefined){
        return false;
    }

    this.m_sudoku = new Array();

    for(var i = 0; i < arrOf81Values.length; i++){
        if(arrOf81Values[i] >= 1 && arrOf81Values[i] <= 9){
            var cell = new SudokuCell();
            cell.m_numList.push(arrOf81Values[i]);
            cell.isFinalized = true;
            cell.finalizedValue = arrOf81Values[i];
            this.m_sudoku.push(cell);
        }
        else{
            var cell = new SudokuCell(9);
            this.m_sudoku.push(cell);
        }
    }
}
//Function that returns a Sudoku3x3Block for one of the 9 possible 3x3 boxes in the puzzle.
//The row and column indices will be in the range [0,2].
Sudoku9x9.prototype.get3x3 = function (rowlIndex, colIndex)
{
    var topLeftIndex = rowlIndex * 27 + colIndex * 3;
    var arrOf9Cells = new Array();

    arrOf9Cells.push(this.m_sudoku[topLeftIndex]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 1]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 2]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 9]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 10]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 11]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 18]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 19]);
    arrOf9Cells.push(this.m_sudoku[topLeftIndex + 20]);

    var resultBlock = new Sudoku3x3Block(arrOf9Cells);

    return resultBlock;
}
//Function that returns a SudokuCellBlock containing the 9 cells from the specified column.
//The column index will be in the range [0,8].
Sudoku9x9.prototype.getColumn = function(colIndex)
{
    var arr = new Array();

    for(var i = 0; i < 9; i++){
        arr.push(this.m_sudoku[i * 9 + colIndex]);
    }

    var resultBlock = new SudokuCellBlock(arr);
    return resultBlock;
}
Sudoku9x9.prototype.getRow = function(rowIndex)
{
    var arr = new Array();

    for(var i = 0; i < 9; i++){
        arr.push(this.m_sudoku[rowIndex * 9 + i]);
    }

    var resultBlock = new SudokuCellBlock(arr);
    return resultBlock;
}
//Function that returns a deep copy of the array of cell references.
Sudoku9x9.prototype.toArray = function()
{
    var arr = new Array();

    for(var i = 0; i < this.m_sudoku.length; i++){
        var tmp = new SudokuCell();
        tmp.m_numList = this.m_sudoku[i].m_numList;
        tmp.isFinalized = this.m_sudoku[i].isFinalized;
        tmp.finalizedValue = this.m_sudoku[i].finalizedValue;
        arr.push(tmp);
    }

    return arr;
}
