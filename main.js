import { bake_cookie, eat_cookie, deleteCookie } from "./cookies.js";

const menuDiv  =document.querySelector("#menu")
const gameDiv = document.querySelector("#game")


//Menu
const name1Text = document.querySelector("#name1")
const difficulty = document.querySelector("#difficulty")
const startBtn = document.querySelector("#start")


let name
startBtn.addEventListener("click", startGame)


//Jatek
const tableBody = document.querySelector("#prevGamesBody")
const savedTable = document.querySelector("#savedGamesBody")
savedTable.addEventListener("click", loadSavedGame)
const outputTime = document.querySelector("#time")
const table = document.querySelector("#gameBoardBody")
table.addEventListener("click", clickTile)
const output = document.querySelector("#output")
const restartBtn = document.querySelector("#restart")
restartBtn.addEventListener("click", restartGame)
const saveBtn = document.querySelector("#saveGame")
const stopBtn = document.querySelector("#stop")
const resumeBtn = document.querySelector("#resume")

saveBtn.addEventListener("click", saveGame)
stopBtn.addEventListener("click", stopGame)
resumeBtn.addEventListener("click", resumeGame)


const savedTableNumber = eat_cookie("numberOfGames")
const prevGamesNumber = eat_cookie("prevGamesNumber")
let loaded = false

if(savedTableNumber != null){
    let size = parseInt(savedTableNumber)
    for(let i = 1; i<=size; ++i){

        addToSavedGames(i)
    }
}
if(prevGamesNumber != null){
    let size = parseInt(prevGamesNumber)
    for(let i = 1; i<=size; ++i){

        insertIntoPreviousWins(i)
    }
}


let stoppedTime
let stoppedTimeStart

let loadedNr
let seconds
let size;
let dif;
let boardMatrix=[]
let iluminatedMatrix=[]
let timeoutId
let elapsedTime
let startingTime = 0
const yellow ="#fcfc86"
const white = "#fff"
const red ="#ff0000"
const green ="#22ff00"
const black ="#000000"
const bgCol = "#8080ff"


function clickTile(e){

    const td = e.target.closest("td");

    if (e.target.closest("td")) {
        const row = e.target.closest("tr").rowIndex;
        const col = td.cellIndex;
        const image = td.querySelector('img');

        if(isObstacle(row,col)){
            return
        }
 
        if (image === null) {
            placeBulb(row, col);
        } else {
            removeBulb(image,row,col);
        }
        if(checkWin()){
            clearTimeout(timeoutId);
            output.innerHTML = "You won! It took you " + elapsedTime + " seconds."
            table.removeEventListener("click", clickTile)
            restart.hidden = false
            saveBtn.hidden = true
            stopBtn.hidden = true
            resumeBtn.hidden = true
            saveWonGame()
        }
    }
    
}

//___________START/END OF GAME____________________

function checkWin(){
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){
           if(boardMatrix[i][j] == 666 && !numberOfBulbsAround(i,j)){
               
               return false
           }
           if(iluminatedMatrix[i][j] == 0 && !isObstacle(i,j)){
               return false
           }
        }
    }
    return true
}

function restartGame(){
    boardMatrix=[]
    iluminatedMatrix=[]
    clearTimeout(timeoutId);
    name1Text.value = name
    menuDiv.hidden = false
    gameDiv.hidden = true
    table.innerHTML ="<tbody></tbody>"
    table.style.visibility="visible"
    table.style.backgroundColor = white
    table.addEventListener("click", clickTile)
    
}

function startGame(id){
    menuDiv.hidden = true
    gameDiv.hidden = false
    restartBtn.hidden = true
    saveBtn.hidden = false
    stopBtn.hidden = false
    resumeBtn.hidden = true
    table.style.visibility="visible"
    table.style.backgroundColor = white
    seconds = new Date();
    stoppedTime = 0
    refreshTime()
    if(id != 1){    
        elapsedTime = 0
        startingTime = 0
        loaded = false
        if(!tryReadInput())
            return

        let board = difficulty.value
        
        if (board === "e"){
            size = 7
            dif = 0
            drawBoard(7,0)
            
        }else if (board === "h"){
            size = 7
            dif = 1
            drawBoard(7,0)
            
        }else if(board === "x"){
            size = 10
            dif = 2
            drawBoard(10,0)
        }
    }else{
        drawBoard(boardMatrix.length, 1)
        putSavedLightbulbs()
    }
    output.innerHTML = name  + " is playing"

}

function stopGame(){
    stopBtn.hidden = true
    resumeBtn.hidden = false
    stoppedTimeStart = new Date()
    table.removeEventListener("click", clickTile)
    clearTimeout(timeoutId);
    for(let i=0; i < size; ++i){
        for(let j = 0; j < size; ++j){
            table.rows[i].cells[j].style.transitionDelay="0s"
        }
    }
    table.style.visibility="hidden"
    table.style.backgroundColor = bgCol
    
}

function resumeGame(){
    stopBtn.hidden = false
    resumeBtn.hidden = true
    
    table.style.visibility="visible"
    table.style.backgroundColor = white
    table.addEventListener("click", clickTile)
    
    stoppedTime += new Date() - stoppedTimeStart 
    console.log(stoppedTime)
    refreshTime()
}

function loadSavedGame(e){
    const rowNumber  = e.target.closest("tr").rowIndex

    let elem = eat_cookie("game"+rowNumber)
    loaded = true
    loadedNr = rowNumber

    /* 
    playerName: name,
        difficulty: dif,
        board: boardMatrix,
        lights: iluminatedMatrix,
        time: elapsedTime
    */

    boardMatrix = elem.board
    size = boardMatrix.length
    dif = elem.difficulty
    startingTime = elem.time
    name = elem.playerName

    startGame(1)

}

//________________________________________



//____________________BULBS____________________

function putSavedLightbulbs(){
    for (let i = 0; i < boardMatrix.length; i++) {
        for (let j = 0; j < boardMatrix.length; j++) {
            if( boardMatrix[i][j] == -1 || boardMatrix[i][j] == 1){
                placeBulb(i,j)
            }
        }
    }
}

function removeBulb(image,row,col){
    const cell = table.rows[row].cells[col]
    image.remove()
    
    iluminatedMatrix[row][col]--
    //console.log(`iluminated matrix on ${row},${col}: ${iluminatedMatrix[row][col]}`)
   // if(boardMatrix[row][col] == -1){
    if(iluminatedMatrix[row][col] != 0){
        table.rows[row].cells[col].style.backgroundColor = yellow
    }else{
        table.rows[row].cells[col].style.backgroundColor = white
    }
        
    //}
    bulbIsPlacedOrRemoved(row,col,0)
    boardMatrix[row][col] = 0
    checkBulbsInLineCol(row,col)
    
    checkAround(row,col)
    
}

function checkBulbsInLineCol(row,col){
    let db1 = 0
    let c

    //sor jobbra
    for(let i = col+1; i < size && !isObstacle(row,i); ++i){
        if (boardMatrix[row][i] == -1){
            db1 += 1
            c = i
            //console.log(`${row} : ${c}`)
        }
    }
    //console.log(`in line right: ${db1}`)


    //sor balra
    let db2 = 0
    for(let i = col-1; i >= 0 && !isObstacle(row,i); --i){
        if (boardMatrix[row][i] == -1){
            db2 += 1
            c = i
            //console.log(`${row} : ${c}`)
        }
    }
    //console.log(`in line left: ${db2}`)
    
    if((db1 + db2) == 1 && notInLineWithAnotherBulb(row,c)){
        //console.log(`${row} : ${c}`)
        table.rows[row].cells[c].style.backgroundColor = yellow
        boardMatrix[row][c] = 1
    }

    //oszlop le
    db1 = 0
    for(let i = row + 1; i < size && !isObstacle(i,col); ++i){
        if (boardMatrix[i][col] == -1  && i != row){
            db1 += 1
            c = i
            //console.log(`${c} : ${col}`)
        }
    }
    //console.log(`in col down: ${db1}`)

    //oszlop fel
    db2 = 0
    for(let i = row - 1; i >= 0 && !isObstacle(i,col); --i){
        if (boardMatrix[i][col] == -1  && i != row){
            db2 += 1
            c = i
            //console.log(`${c} : ${col}`)
        }
    }
    //console.log(`in col up: ${db2}`)

    if((db1+db2) == 1 && notInLineWithAnotherBulb(c,col)){
        //console.log(`${c} : ${col}`)
        table.rows[c].cells[col].style.backgroundColor = yellow
        boardMatrix[c][col] = 1
    }
}

function placeBulb(row, col){
    const cell = table.rows[row].cells[col]
    
    let imgSrc = randomImage()
    cell.innerHTML = `<img src=\"${imgSrc}\" id=\"bulb\" />`
    
    iluminatedMatrix[row][col]++ 
    
    if(!notInLineWithAnotherBulb(row,col)){
        boardMatrix[row][col] = -1
        cell.style.backgroundColor = red
        bulbIsPlacedOrRemoved(row,col,1)
        checkAround(row,col)
        
        
        return
    }
    boardMatrix[row][col] = 1
    table.rows[row].cells[col].style.backgroundColor = yellow
    bulbIsPlacedOrRemoved(row,col,1)
    checkAround(row,col)
    //printIl()
    
}

function bulbIsPlacedOrRemoved(row,col, id){
    if( id == 1){
        
        iluminate(row, col,1,0)
        iluminate(row, col,-1,0)
        iluminate(row, col,0,1)
        iluminate(row, col,0,-1)
    }else{
        
        deluminate(row, col,1,0)
        deluminate(row, col,-1,0)
        deluminate(row, col,0,1)
        deluminate(row, col,0,-1)
    }
}

function isInPlayArea(row, col){
    return row < size &&
            row >= 0 &&
            col < size &&
            col >= 0
}

function deluminate(row, col, x, y){
    row += x
    col += y
    for(let i = 0; isInPlayArea(row, col) && !isObstacle(row,col); i++){
        const cell = table.rows[row].cells[col]
        iluminatedMatrix[row][col]--
        if(iluminatedMatrix[row][col] < 1){
            cell.style.transitionDelay = "0s"
            cell.style.backgroundColor = white
        }
        row += x
        col += y
        
    }
}

function iluminate(row, col, x, y){
    let trans_delay = 0.0
    row += x
    col += y
    for(let i = 0; isInPlayArea(row, col) && !isObstacle(row,col); i++){
        trans_delay += 0.04
        const cell = table.rows[row].cells[col]
        
        if(boardMatrix[row][col] != -1){
            cell.style.transitionDelay = trans_delay.toString() + "s"
            cell.style.backgroundColor = yellow
        }
        iluminatedMatrix[row][col]++ 
        row += x
        col += y
    }
}

function notInLineWithAnotherBulb(row,col){
    
    return inSameCol(row,col) && inSameRow(row,col);
}

function inSameCol(row,col){
    let up = true
    let down = true
    let i = row + 1
    while(i < size && boardMatrix[i][col] != 666 ){
        if(boardMatrix[i][col] == 1 || boardMatrix[i][col] == -1){
            table.rows[i].cells[col].style.backgroundColor = red
            boardMatrix[i][col] = -1
            up = false
            //console.log(`lent: ${i},${col}`)
            
        }
        ++i
    }
    i = row - 1
    while(i >= 0 && boardMatrix[i][col] != 666 ){
        if(boardMatrix[i][col] == 1 || boardMatrix[i][col] == -1){
            down = false
            table.rows[i].cells[col].style.backgroundColor = red
            boardMatrix[i][col] = -1
            //console.log(`fent: ${i},${col}`)
        }
        --i
    }
    return up && down
}

function inSameRow(row,col){
    let right = true
    let left = true
    let i = col + 1

    //sor jobbra
    while(i < size && boardMatrix[row][i] != 666 ){
        if(boardMatrix[row][i] == 1 || boardMatrix[row][i] == -1){
            right = false
            table.rows[row].cells[i].style.backgroundColor = red
            boardMatrix[row][i] = -1
            //console.log(`jobb oldalt: ${row},${i}`)
        }
        ++i
    }

    //sor balra
     i = col - 1
    while(i >= 0 && boardMatrix[row][i] != 666 ){
        if(boardMatrix[row][i] == 1 || boardMatrix[row][i] == -1){
            left = false
            table.rows[row].cells[i].style.backgroundColor = red
            boardMatrix[row][i] = -1
            //console.log(`bal oldalt: ${row},${i}`)
        }
        --i
    }
    return left && right
}

function printIl(){
    for(let i=0; i < size; ++i){
        console.log(iluminatedMatrix[i])
        console.log(``)
    }
}

function numberOfBulbsAround(row,col){
    const cell = table.rows[row].cells[col]
    let number = parseInt(cell.innerText)
    let db = 0
    if(isInPlayArea(row+1,col) && boardMatrix[row+1][col] == 1){
        db++
    }if(isInPlayArea(row-1,col) && boardMatrix[row-1][col] == 1){
        db++
    }if(isInPlayArea(row,col+1) && boardMatrix[row][col+1] == 1){
        db++
    }if(isInPlayArea(row,col-1) && boardMatrix[row][col-1] == 1){
        db++
    }
    if (number < 0 || db == number){
        if(db == number){
            cell.style.color =green
        }
        return true
    }else if(db>number){
        cell.style.color=red
    }else{
        cell.style.color=white
    }
    return false
}

function checkAround(row,col){
    if(isInPlayArea(row+1,col) && boardMatrix[row+1][col] == 666){
        numberOfBulbsAround(row+1,col)
    }if(isInPlayArea(row-1,col) && boardMatrix[row-1][col] == 666){
        numberOfBulbsAround(row-1,col)
    }if(isInPlayArea(row,col+1) && boardMatrix[row][col+1] == 666){
        numberOfBulbsAround(row,col+1)
    }if(isInPlayArea(row,col-1) && boardMatrix[row][col-1] == 666){
        numberOfBulbsAround(row,col-1)
    }
}

function isObstacle(row, col){
    return boardMatrix[row][col] == 666
}

//________________________________________



///////// Interface ////////


function refreshTime(){
    elapsedTime =Math.floor((new Date() - seconds -  stoppedTime)/1000) + startingTime
    outputTime.innerHTML ="Elapsed Time: "+ (elapsedTime).toString() + "s"
    timeoutId = setTimeout(refreshTime, 1000)
}

function tryReadInput(){
    if(name1Text.value === "")
        return false;

    name = name1Text.value
    
    return true
}

function drawBoard(size, id){
    for(let i = 0; i < size; i++){
        const row = table.insertRow()

        if(id != 1){
            boardMatrix[i] = []
            
        }
        iluminatedMatrix[i] = []

        for(let j = 0; j < size; j++){
            row.insertCell()
            if(id != 1){
                boardMatrix[i][j] = 0
                
            }
            iluminatedMatrix[i][j] = 0
        }
    }
    setBoardDifficulty(dif)
}

function setBoardDifficulty(dif){
    let cells
    if(dif == 0){
        cells = [[0,3,1],[1,1,0],[1,5,2],
                    [3,0,-1],[3,3,-1],[3,6,-1],
                    [5,1,-1],[5,5,2],[6,3,3]]
    }else if(dif == 1){
        cells = [[0,2,0],[0,4,-1],[2,2,-1],[2,0,-1],[2,4,3],
        [2,6,-1],[3,3,1],[4,0,2],[4,2,-1],[4,4,-1],[4,6,-1],[6,2,-1],[6,4,2]]
    }else{
        cells = [[0,1,-2],
                    [1,5,3],[1,7,2],[1,9,-1],
                    [2,1,0],[2,2,-1],[2,7,-1],
                    [3,4,-1],
                    [4,1,1],[4,4,-1],[4,5,1],[4,6,-1],
                    [5,3,-1],[5,4,-1],[5,5,-1],[5,8,3],
                    [6,5,-1],
                    [7,2,1],[7,7,0],[7,8,-1],
                    [8,0,3],[8,2,-1],[8,4,0],
                    [9,8,0]]
    }
    setNumbers(cells)
}

function setNumbers(cells){
    for(let i = 0; i < cells.length; i++){
        let row = cells[i][0]
        let col = cells[i][1]
        let number =  cells[i][2]
        boardMatrix[row][col] = 666
        let cell = table.rows[row].cells[col]
        cell.innerText = number
        if(number < 0){
            cell.style.color = black
        }else if(number == 0){
            numberOfBulbsAround(row,col)
        }
        cell.style.backgroundColor = black
    }
}

//__________________COOKIES__________________

function saveGame(){
    const numberOfGamesSaved = eat_cookie("numberOfGames")
    let nr = 0
    //console.log(`nr: ${nr}`)
    if(loaded){
        nr = loadedNr
    }else if(numberOfGamesSaved !=null){
        nr = parseInt(numberOfGamesSaved)
        nr++
        bake_cookie("numberOfGames",nr)
    }else{
        nr = 1
        bake_cookie("numberOfGames",1)
    }

    
    
    bake_cookie("game"+nr, {
        playerName: name,
        difficulty: dif,
        board: boardMatrix,
        lights: iluminatedMatrix,
        time: elapsedTime
    })
    nr = parseInt(nr)
    addToSavedGames(nr)
    restartGame()
    clearTimeout(timeoutId);
}

function addToSavedGames(nr){
    let elem = eat_cookie("game"+nr)

    savedTable.insertRow()
    let cell
    if(!loaded){
        cell = savedTable.rows[nr].insertCell()
    }else{
        cell = savedTable.rows[nr].cells[0]
    }
    cell.innerHTML = elem.playerName

    if(!loaded){
        cell = savedTable.rows[nr].insertCell()
    }else{
        cell = savedTable.rows[nr].cells[1]

    }
    let dStr=elem.difficulty;
    switch(elem.difficulty){
        case 0:
            dStr = "7x7 Easy"
            break;
        case 1:
            dStr = "7x7 Hard"
            break;
        case 2:
            dStr ="10x10 Extreme"
            break;
    
    }
    cell.innerHTML = dStr

    if(!loaded){
        cell = savedTable.rows[nr].insertCell()
    }else{
        cell = savedTable.rows[nr].cells[2]

    }
    cell.innerHTML = elem.time + " seconds"

}

function saveWonGame(){
    const numberOfGamesWon = eat_cookie("prevGamesNumber")
    let nr = 0
    if(numberOfGamesWon !=null){
        nr = parseInt(numberOfGamesWon)
        nr++
        bake_cookie("prevGamesNumber",nr)
    }else{
        nr = 1
        bake_cookie("prevGamesNumber",1)
    }
    bake_cookie("finishedGame"+nr, {
        playerName: name,
        difficulty: dif,
        time: elapsedTime
    })

    insertIntoPreviousWins(nr)
}

function insertIntoPreviousWins(nr){
    let elem = eat_cookie("finishedGame"+nr)

    tableBody.insertRow()

    let cell = tableBody.rows[nr].insertCell()
    cell.innerHTML = elem.playerName

    cell = tableBody.rows[nr].insertCell()
    cell.innerHTML = elem.time + " seconds"

    cell = tableBody.rows[nr].insertCell()
    let dStr="";
    switch(elem.difficulty){
        case 0:
            dStr = "7x7 Easy"
            break;
        case 1:
            dStr = "7x7 Hard"
            break;
        case 2:
            dStr ="10x10 Extreme"
            break;
    }
    cell.innerHTML = dStr

}

//_______________________________________

function randomImage(){
    let dank = true
    let id = getRandomInt(3)
    if(dank){
        switch(id){
            case 0:
                return "cat.png"
            case 1:
                return "pingu.png"
            case 2:
                return "shrek.png"
        }
    }else{
        switch(id){
            case 0:
                return "bulb.png"
            case 1:
                return "bulb2.png"
            case 2:
                return "bulb3.png"
        }
    }
    return "bulb.png"
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}