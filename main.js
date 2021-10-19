var teamTurn = true; //Farther Team = team
var clickTracker = 0; //Number Of Times A Player Has Clicked In A Turn
var objectClickedTracker = []; //Records Which Two Elements Are Being Used By Player
var legalMove = true; //Determines If Player's Desired Move Is Legal
var gamePieces = []; //Holds All Game Piece Objects
var rowNameOrder = ["A", "B", "C", "D", "E", "F", "G", "H"]; //List To Show Order Of Rows
//List Of Legal Moves From One Row To Another (A -> B == team) (B -> A == otherTeam)
var legalSingleMove = [
  ["A", "B"],
  ["B", "C"],
  ["C", "D"],
  ["D", "E"],
  ["E", "F"],
  ["F", "G"],
  ["G", "H"]
];
//List Of Legal Jumps From One Row To Another (A -> C == team) (C -> A == otherTeam)
var legalJumpMove = [
  ["A", "C"],
  ["B", "D"],
  ["C", "E"],
  ["D", "F"],
  ["E", "G"],
  ["F", "H"]
];

//--------------------------------------------------Object Creation On Startup--------------------------------------------------
//Creates Objects For Game Pieces And Adds Them To gamePieces
window.addEventListener("load", function(){
  for(i = 0; i < document.getElementsByClassName("gamePiece").length; i++){
    gamePieces[i] = Object.create(gamePieceNumberBase);
    gamePieces[i].position = document.getElementsByClassName("gamePiece")[i].parentElement.id;
    gamePieces[i].teamString = document.getElementsByClassName("gamePiece")[i].classList[1];
  }
});

//Template Model For Piece Objects
var gamePieceNumberBase = {
  //Position Properties
  position:"A-1",
  row:function(){
    return this.position.split("-")[0];
  },
  column:function(){
    return this.position.split("-")[1];
  },
  //Piece Type Properties
  teamString:"team",
  isKing:false,
  isTeam:function(){
    if(this.teamString == "team"){
      return true;
    } else {
      return false;
    }
  }
}

//--------------------------------------------------User Customization Settings--------------------------------------------------

//contextmenu evenet listener

//--------------------------------------------------Mouse Click Handling And Turn Processing--------------------------------------------------
function clickHandler(gamePiece){
  //Selects Game Object
  objectClickedTracker[clickTracker] = gamePiece;

  if(clickTracker == 0){
    legalMove = true;
    clickTracker++;
  //Checks If Piece Can Move To Selected Location
  } else if(clickTracker == 1){
    //Get Javascript Object For Specific HTML Element
    var pieceHTMLObject = objectClickedTracker[0];
    for(i = 0; i < gamePieces.length; i++){
      if(objectClickedTracker[0].id == gamePieces[i].position){
        objectClickedTracker[0] = gamePieces[i];
      }
    }
    //Check If Desired Move Is Legal And Update Error Display
    var move = checkMove(objectClickedTracker[0], objectClickedTracker[1]);
    if(move != null){
      document.getElementById("playerErrorDisplay").style.visibility = "visible";
      document.getElementById("playerErrorDisplay").innerText = move;
    } else {
      document.getElementById("playerErrorDisplay").style.visibility = "hidden";
    }
    //Moves Piece If Legal Move And Updates Turn Display
    if(legalMove){
      var movedPiece = movePiece(pieceHTMLObject, objectClickedTracker[1]);
      if(teamTurn && movedPiece){
        teamTurn = false;
        document.getElementById("playerTurnDisplay").style.backgroundColor = window.getComputedStyle(document.getElementsByClassName("otherTeam")[0]).getPropertyValue("background-color");
      } else if(movedPiece){
        teamTurn = true;
        document.getElementById("playerTurnDisplay").style.backgroundColor = window.getComputedStyle(document.getElementsByClassName("team")[0]).getPropertyValue("background-color");
      }
    }
    objectClickedTracker = [];
    clickTracker--;
  }
}

//Moves Pieces to New Squares
function movePiece(pieceObject, squareObject){
  for(i = 0; i < gamePieces.length; i++){
    if(pieceObject.id == gamePieces[i].position){
      if(squareObject.id.split("-")[0] == "A" && !gamePieces[i].isTeam() || squareObject.id.split("-")[0] == "H" && gamePieces[i].isTeam()){
        gamePieces[i].isKing = true;
        pieceObject.children[0].classList.add("kingPiece");
      }
      gamePieces[i].position = squareObject.id;
      squareObject.appendChild(pieceObject.children[0]);
      pieceObject.innerHTML = "";
    }
  }
  var gameDoneTeam = 0;
  var gameDoneOtherTeam = 0;
  for(i = 0; i < gamePieces.length; i++){
    if(gamePieces[i].teamString == "team"){
      gameDoneTeam += 1;
    } else {
      gameDoneOtherTeam += 1;
    }
  }
  if(gameDoneTeam == 0){
    document.getElementById("playerWinDisplay").innerText = "Player 1 Wins!";
    document.getElementById("playerWinDisplay").style.visibility = "visible";
    document.getElementById("playerWinDisplay").style.backgroundColor = "black";
    return false;
  } else if(gameDoneOtherTeam == 0){
    document.getElementById("playerWinDisplay").innerText = "Player 2 Wins!";
    document.getElementById("playerWinDisplay").style.visibility = "visible";
    document.getElementById("playerWinDisplay").style.backgroundColor = "#8c1f41";
    return false;
  } else if(gameDoneTeam == 1 && gameDoneOtherTeam == 1){
    document.getElementById("playerWinDisplay").innerText = "It's A Tie!";
    document.getElementById("playerWinDisplay").style.visibility = "visible";
    document.getElementById("playerWinDisplay").style.backgroundColor = "grey";
    return false;
  } else {
    return true;
  }
}

//--------------------------------------------------Piece Movement Rules Handler--------------------------------------------------
function checkMove(pieceObject, squareObject){
  //If First Square Selected Does Not Contain A Game Piece
  if(pieceObject == undefined){
    legalMove = false;
    return "Game Piece Not Selected";
  }
  //If Not Piece Team's Turn
  if(typeof pieceObject.isTeam !== "function" || !pieceObject.isTeam() && teamTurn || pieceObject.isTeam() && !teamTurn){
    legalMove = false;
    return "Not That Team's Turn";
  }
  //If Piece Moves To Itself
  if(pieceObject.position == squareObject.id){
    legalMove = false;
    return "Can't Move Distance Of 0";
  }
  //If Other Piece Occupying Selected Square
  if(squareObject.children.length > 0){
    legalMove = false;
    return "Piece Already In That Square";
  }
  //If Color Of Square Isn't The Same As H1
  var squareObjectColor = window.getComputedStyle(squareObject).getPropertyValue("background-color");
  if(squareObjectColor != window.getComputedStyle(document.getElementById("H-1")).getPropertyValue("background-color")){
    legalMove = false;
    return "Not A Valid Move Location";
  }
  var canJump;
  var canMove;
  //Checks If The Piece Is A King
  if(!pieceObject.isKing){
    canJump = directionAndDistanceHandler(pieceObject.row(), squareObject.id.split("-")[0], true);
    canMove = directionAndDistanceHandler(pieceObject.row(), squareObject.id.split("-")[0], false);
  } else {
    canJump = kingDirectionAndDistanceHandler(pieceObject.row(), squareObject.id.split("-")[0], true);
    canMove = kingDirectionAndDistanceHandler(pieceObject.row(), squareObject.id.split("-")[0], false);
  }
  //If Selected Square Row Isn't Appropriate Distance Or Direction For Jump
  if(!canJump){
    //If Selected Square Row Isn't Appropriate Distance Or Direction For Move
    if(!canMove){
      legalMove = false;
      return "Not A Valid Move Distance/Direction";
    }
  }
  //If Enemy Isn't Available To Be Jumped Over
  if(canJump){
    var isEnemyToJump;
    //Checks If Piece Is King
    if(!pieceObject.isKing){
      isEnemyToJump = enemyToJumpDetector(pieceObject, squareObject);
    } else {
      isEnemyToJump = kingEnemyToJumpDetector(pieceObject, squareObject);
    }
    if(!isEnemyToJump[0]){
      legalMove = false;
      return "No Enemy To Jump";
    } else {
      for(i = 0; i < gamePieces.length; i++){
        if(isEnemyToJump[1].id == gamePieces[i].position){
          gamePieces.splice(i, 1);
        }
      }
      isEnemyToJump[1].innerHTML = "";
    }
  }
  //If Everything Is Valid
  return null;
}

//--------------------------------------------------Piece Movement Rules Sub-Handlers--------------------------------------------------

//Determines Legal Direction And Distance Of Movement
function directionAndDistanceHandler(pieceObjectRow, squareObjectRow, jumpType){
  var matchFound = false;
  var directionAndDistanceGuide = legalSingleMove;
  //If Jump Then Switch Guides
  if(jumpType){
    directionAndDistanceGuide = legalJumpMove;
  }
  for(i = 0; i < directionAndDistanceGuide.length; i++){
    //Checking Direction For otherTeam
    if(!teamTurn){
      directionAndDistanceGuide[i].reverse();
    }
    //Checking Distance Between Start And End Destinations
    if(pieceObjectRow == directionAndDistanceGuide[i][0] && squareObjectRow == directionAndDistanceGuide[i][1]){
      matchFound = true;
    }
    //Reverts directionAndDistanceGuide To Normal (otherTeam)
    if(!teamTurn){
      directionAndDistanceGuide[i].reverse();
    }
  }
  return matchFound;
}

//Detects If Enemy Available To Jump Over
function enemyToJumpDetector(pieceObject, squareObject){
  //Get Row And Column Coordinates Of Piece And Desired Jump Location
  var pieceObjectRow = pieceObject.row();
  var pieceObjectColumn = pieceObject.column();
  var squareObjectRow = squareObject.id.split("-")[0];
  var squareObjectColumn = squareObject.id.split("-")[1];
  //Coordinates Between Start And End Locations
  var midPointRow;
  var midPointColumn;
  //Find Column Of Game Piece Being Jumped
  if(pieceObjectColumn > squareObjectColumn){
    midPointColumn = pieceObjectColumn - 1;
  } else {
    midPointColumn = squareObjectColumn - 1;
  }
  //Checking Direction For otherTeam
  if(!teamTurn){
    rowNameOrder.reverse();
  }
  //Getting Row Between Start And End Locations
  for(i = 0; i < rowNameOrder.length; i++){
    if(rowNameOrder[i] == pieceObjectRow && rowNameOrder[i+2] == squareObjectRow){
      midPointRow = rowNameOrder[i+1];
    }
  }
  //Reverting rowNameOrder Back To Normal (otherTeam)
  if(!teamTurn){
    rowNameOrder.reverse();
  }
  //Checking If Enemy At Midpoint Coordinates
  var midPointPieceID = midPointRow + "-" + midPointColumn;
  var midPointPiece = document.getElementById(midPointPieceID);
  if(midPointPiece.children.length > 0 && pieceObjectColumn != squareObjectColumn){
    if(midPointPiece.children[0].classList[1] == "team" && !teamTurn){
      return [true, midPointPiece];
    }
    if(midPointPiece.children[0].classList[1] == "otherTeam" && teamTurn){
      return [true, midPointPiece];
    }
  } else {
    return [false, null];
  }
}

//--------------------------------------------------Piece Movement Rules Sub-Handlers For King Pieces--------------------------------------------------

function kingDirectionAndDistanceHandler(pieceObjectRow, squareObjectRow, jumpType){
  var matchFound = false;
  var directionAndDistanceGuide = legalSingleMove;
  //If Jump Then Switch Guides
  if(jumpType){
    directionAndDistanceGuide = legalJumpMove;
  }
  //Checks For team's Original Direction
  for(i = 0; i < directionAndDistanceGuide.length; i++){
    //Checking Distance Between Start And End Destinations
    if(pieceObjectRow == directionAndDistanceGuide[i][0] && squareObjectRow == directionAndDistanceGuide[i][1]){
      matchFound = true;
    }
  }
  //Checks For otherTeam's Original Direction
  if(!matchFound){
    for(i = 0; i < directionAndDistanceGuide.length; i++){
      directionAndDistanceGuide[i].reverse();
      //Checking Distance Between Start And End Destinations
      if(pieceObjectRow == directionAndDistanceGuide[i][0] && squareObjectRow == directionAndDistanceGuide[i][1]){
        matchFound = true;
      }
      directionAndDistanceGuide[i].reverse();
    }
  }
  return matchFound;
}

function kingEnemyToJumpDetector(pieceObject, squareObject){
  //Get Row And Column Coordinates Of Piece And Desired Jump Location
  var pieceObjectRow = pieceObject.row();
  var pieceObjectColumn = pieceObject.column();
  var squareObjectRow = squareObject.id.split("-")[0];
  var squareObjectColumn = squareObject.id.split("-")[1];
  //Coordinates Between Start And End Locations
  var midPointRow;
  var midPointColumn;
  //Find Column Of Game Piece Being Jumped
  if(pieceObjectColumn > squareObjectColumn){
    midPointColumn = pieceObjectColumn - 1;
  } else {
    midPointColumn = squareObjectColumn - 1;
  }
  //Getting Row Between Start And End Locations
  for(i = 0; i < rowNameOrder.length; i++){
    if(rowNameOrder[i] == pieceObjectRow && rowNameOrder[i+2] == squareObjectRow){
      midPointRow = rowNameOrder[i+1];
    }
  }
  if(midPointRow == undefined){
    rowNameOrder.reverse();
    for(i = 0; i < rowNameOrder.length; i++){
      if(rowNameOrder[i] == pieceObjectRow && rowNameOrder[i+2] == squareObjectRow){
        midPointRow = rowNameOrder[i+1];
      }
    }
    rowNameOrder.reverse();
  }
  //Checking If Enemy At Midpoint Coordinates
  var midPointPieceID = midPointRow + "-" + midPointColumn;
  var midPointPiece = document.getElementById(midPointPieceID);
  if(midPointPiece.children.length > 0 && pieceObjectColumn != squareObjectColumn){
    if(midPointPiece.children[0].classList[1] == "team" && !teamTurn){
      return [true, midPointPiece];
    }
    if(midPointPiece.children[0].classList[1] == "otherTeam" && teamTurn){
      return [true, midPointPiece];
    }
  } else {
    return [false, null];
  }
}
