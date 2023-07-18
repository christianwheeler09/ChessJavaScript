//Import the external classes vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
import { Pawn } from './classes/pawn.js';
import { Rook } from './classes/rook.js';
import { Knight } from './classes/knight.js';
import { Bishop } from './classes/bishop.js';
import { Queen } from './classes/queen.js';
import { King } from './classes/king.js';
//Import the external classes ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

export class GameMaster {
    //to convert letters to numbers -- Z is a dummy value -- so the indeces of the letters line up with the numbering on the board
    //             0    1    2    3    4    5    6    7    8    
    #num2alpha = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    #NUM_COLS = 8;//the chess board has 8 columns
    #NUM_ROWS = 8;//the chess board has 8 columns

    #chosenSQ1 = 'Z9';
    #chosenSQ2 = 'Z9';

    #squareIDs = new Set();
    #chessPieces = new Map();
    #whoseTurn = 'Light';
    #occupiedSquares = new Set();

    constructor() {
        //make references for all the square IDs and put them in a set
        //A1 A2 A3... B1 B2 B3...
        for (let c = 1; c <= this.#NUM_COLS; c++) {
            for (let r = 1; r <= this.#NUM_ROWS; r++) {
                this.#squareIDs.add(`${this.#num2alpha[c]}${r}`);
            }
        }
    }

    /**
     * output variables to help with debugging
     */
    debugOutput(squareID) {
        return 'squareID: ' + squareID +
            '\nchosenSQ1: ' + this.#chosenSQ1 +
            '\nchosenSQ2: ' + this.#chosenSQ2 +
            '\nwhoseTurn: ' + this.#whoseTurn +
            '\n';
    }

    /**
     * sets up the game
     */
    gameSetup() {
        this.#createPieces();
        this.#aelSquares();
        this.#aelPawnPromotions();
        this.#aelButton();
    }

    /**
     * creates all of the chess pieces and places them on the board
     */
    #createPieces() {
        //Create the dark chess pieces
        this.#chessPieces.set('DR2', new Rook('DR2', 'dark', 'A8', 'images/dark-rook.png'));
        this.#chessPieces.set('DN2', new Knight('DN2', 'dark', 'B8', 'images/dark-knight.png'));
        this.#chessPieces.set('DB2', new Bishop('DB2', 'dark', 'C8', 'images/dark-bishop.png'));
        this.#chessPieces.set('DQ', new Queen('DQ', 'dark', 'D8', 'images/dark-queen.png'));
        this.#chessPieces.set('DK', new King('DK', 'dark', 'E8', 'images/dark-king.png'));
        this.#chessPieces.set('DB1', new Bishop('DB1', 'dark', 'F8', 'images/dark-bishop.png'));
        this.#chessPieces.set('DN1', new Knight('DN1', 'dark', 'G8', 'images/dark-knight.png'));
        this.#chessPieces.set('DR1', new Rook('DR1', 'dark', 'H8', 'images/dark-rook.png'));

        //Create the dark pawns
        //loops through 8 times -- one for each pawn
        for (let col = 0; col < this.#NUM_COLS; col++) {
            //creates dark pawn 8, ... dark pawn 1, and places it in the data structure
            const ID = `DP${this.#NUM_COLS - col}`;
            const LOCATION = `${this.#num2alpha[col + 1]}7`;
            this.#chessPieces.set(ID, new Pawn(ID, 'dark', LOCATION, 'images/dark-pawn.png'));
        }

        //Create the light pawns
        //loops through 8 times -- one for each pawn
        for (let col = 0; col < this.#NUM_COLS; col++) {
            //creates light pawn 8, ... light pawn 1, and places it in the data structure
            const ID = `LP${col + 1}`;
            const LOCATION = `${this.#num2alpha[col + 1]}2`;
            this.#chessPieces.set(ID, new Pawn(ID, 'light', LOCATION, 'images/light-pawn.png'));
        }

        //Create the light chess pieces
        this.#chessPieces.set('LR1', new Rook('LR1', 'light', 'A1', 'images/light-rook.png'));
        this.#chessPieces.set('LN1', new Knight('LN1', 'light', 'B1', 'images/light-knight.png'));
        this.#chessPieces.set('LB1', new Bishop('LB1', 'light', 'C1', 'images/light-bishop.png'));
        this.#chessPieces.set('LQ', new Queen('LQ', 'light', 'D1', 'images/light-queen.png'));
        this.#chessPieces.set('LK', new King('LK', 'light', 'E1', 'images/light-king.png'));
        this.#chessPieces.set('LB2', new Bishop('LB2', 'light', 'F1', 'images/light-bishop.png'));
        this.#chessPieces.set('LN2', new Knight('LN2', 'light', 'G1', 'images/light-knight.png'));
        this.#chessPieces.set('LR2', new Rook('LR2', 'light', 'H1', 'images/light-rook.png'));

        //Once I create all the ChessPiece objects, place them on the board
        this.#chessPieces.forEach(chessPiece => {
            const element = document.createElement('img');
            element.id = chessPiece.getPieceID();
            element.src = chessPiece.getImage();
            element.alt = chessPiece.getPieceID();
            let currentLocation = `#${chessPiece.getLocation()}`;
            document.querySelector(currentLocation).textContent = chessPiece.getPieceID();
            document.querySelector(currentLocation).appendChild(element);
            this.#occupiedSquares.add(chessPiece.getLocation());//occupy the starting location
        });
    }

    /**Add Event Listener to the button
     * this function adds an event listener to the button that moves the pieces
     */
    #aelButton() {
        const btnMove = document.querySelector('#btnMove');
        btnMove.addEventListener('click', e => {
            e.preventDefault();
            const pieceID = document.querySelector('#lblSQ1').textContent;//get the piece ID from the label
            const chessPiece = this.#chessPieces.get(pieceID);//get the chessPiece object to be moved
            const destination = document.querySelector('#lblSQ2').textContent;//get the new location from the input, trimmed and upper case
            if (chessPiece.canMove(destination, this.#occupiedSquares)) {//if this chess piece is allowed to move there
                this.#occupiedSquares.delete(chessPiece.getLocation());//de-occupy the old location
                chessPiece.move(destination);//move it to the new location
                this.#occupiedSquares.add(destination);//occupy the new location

                // check for pawn promotion
                if (this.#checkPawnPromotion(chessPiece)) {
                    console.log('PROMOTING PAWN');
                    this.#promotePawn(chessPiece);
                }

                this.#startNextTurn(); //start the next turn
            }
        });
    }

    /**
     * Makes the board ready for the next turn
     */
    #startNextTurn() {
        console.log('entered startNextTurn() function');
        this.#whoseTurn = this.#whoseTurn === 'Light' ? 'Dark' : 'Light'; // if it was light's turn, it is now dark's turn, and vice versa
        document.querySelector('#whoseTurn').innerText = this.#whoseTurn;

        // unclick both squares
        this.#unclickSQ1(this.#chosenSQ1);
        this.#unclickSQ2(this.#chosenSQ2);
    }

    /**Add Event Listener to the Squares
     * this function adds an event listener to each button, so the user can choose how to move
     */
    #aelSquares() {
        this.#squareIDs.forEach(squareID => {
            document.querySelector(`#${squareID}`).addEventListener('click', e => {
                if (squareID === this.#chosenSQ1) {
                    console.log('first if');
                    this.#unclickSQ1(squareID);
                    //return;
                }
                else if (squareID === this.#chosenSQ2) {
                    console.log('second if');
                    this.#unclickSQ2(squareID);
                    //return;
                }
                else if (this.#occupiedSquares.has(squareID)) { // Is this square occupied?
                    console.log('third if');
                    // Does this square contain an ally?
                    if (document.querySelector(`#${squareID}`).innerText[0].toLowerCase() === this.#whoseTurn[0].toLowerCase()) {
                        console.log('fourth if');
                        this.#clickSQ1(squareID);
                        //return;
                    }
                    else { // else this square contains an enemy
                        console.log('fifth if');
                        this.#clickSQ2(squareID);
                        //return;
                    }
                }
                else {
                    console.log('last else');
                    this.#clickSQ2(squareID);
                    //return;
                }
            });
        });
    }

    #unclickSQ1(squareID) {
        document.querySelector('#lblSQ1').innerText = 'source';
        this.#chosenSQ1 = 'Z9';
        document.querySelector(`#${squareID}`).classList.remove('ally');
    }

    #unclickSQ2(squareID) {
        document.querySelector('#lblSQ2').innerText = 'target';
        this.#chosenSQ2 = 'Z9';
        document.querySelector(`#${squareID}`).classList.remove('enemy');
    }

    #clickSQ1(squareID) {
        document.querySelector(`#${this.#chosenSQ1}`).classList.remove('ally');
        document.querySelector(`#${squareID}`).classList.add('ally');
        this.#chosenSQ1 = squareID;
        document.querySelector('#lblSQ1').innerText = document.querySelector(`#${squareID}`).innerText;
    }

    #clickSQ2(squareID) {
        document.querySelector(`#${this.#chosenSQ2}`).classList.remove('enemy');
        document.querySelector(`#${squareID}`).classList.add('enemy');
        this.#chosenSQ2 = squareID;
        document.querySelector('#lblSQ2').innerText = squareID;
    }

    #checkPawnPromotion(chessPiece) {
        // if this is a pawn
        if (chessPiece.getType() === 'Pawn') {
            // is the team Light?
            if (chessPiece.getTeam() === 'Light') {
                // eligible for promotion if rank is 8
                return chessPiece.getRank() === 8;
            }
            else { // the team is Dark
                return chessPiece.getRank() === 1;
            }
        }
        else return false; // not a pawn
    }

    #promotePawn(pawn) {
        if(pawn.getTeam() === 'Light'){
            //remove the hidden attribute, so they can submit the form
            document.querySelector('#divLightPromo').classList.remove('hidden');
        }
        else { // team is dark
            //remove the hidden attribute, so they can submit the form
            document.querySelector('#divDarkPromo').classList.remove('hidden');
        }
    }

    /**
     * adds event listeners for promoting pawns buttons
     */
    #aelPawnPromotions(){
            //TODO: PROMOTE LIGHT PAWN
            //TODO: PROMOTE DARK PAWN

    }
}