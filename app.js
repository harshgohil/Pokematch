document.addEventListener('DOMContentLoaded', () => {
    // card names
    const CARD_NAMES = ['bulbasaur.png', 
                        'caterpie.png', 
                        'charmander.png', 
                        'eevee.png', 
                        'geodude.png', 
                        'meowth.png', 
                        'pikachu-f.png', 
                        'psyduck.png', 
                        'snorlax.png', 
                        'squirtle.png',
                        'blastoise.png',
                        'vulpix.png',
                        'pidgey.png',
                        'jigglypuff.png',
                        'magikarp-f.png',
                        'gastly.png', 
                        'abra.png',
                        'ditto.png',
                        'mew.png',
                        'oddish.png'];

    let cardsList = [];

    // ids of 2 chosen cards are stored in here.
    let chosenCards = []; 
    let totalScore = 0;
    let attempts = 0;
    let matched = 0; // number of cards matched
    let seconds = 0; 
    // flag to know if reset was pressed, used to avoid displaying score screen when timer is set to 0. 
    let resetPressed = false;
    // flag to know if player finished matching all cards or if timer expires. 
    // used to remove score screen when reset is pressed.
    let endReached = false;

    const SCORE_ID_KEY = 'SCORE_ID_COUNT'; 

    // initialize score as 0 for scoreLabel
    document.getElementById('score-label').textContent = `Score: 0`;
    document.getElementById('timer-label').textContent = `Time: 0`; 

    // set a id count for locally stored scores if one does not already exist
    if (localStorage.getItem(SCORE_ID_KEY) === null){
        localStorage.setItem(SCORE_ID_KEY, 0); 
    }



    let selectUpBtn = document.querySelector('.select-up'); 
    let selectDownBtn = document.querySelector('.select-down');
    let playBtn = document.querySelector('.play'); 
    let resetBtn = document.querySelector('.reset');
    let levelLabel = document.querySelector('.difficultyLabel');
    let settingsDiv = document.querySelector('div.settings'); 
    let scoreDiv = document.querySelector('div.score');
    let startScreen = document.querySelector('div.start-screen');
    let scoreCardContainer = document.createElement('div');

    const grid = document.querySelector('#game-grid');

    // reset button is initially disabled, only enabled when the game starts. 
    resetBtn.disabled = true;



    // Event listeners for select buttons to toggle difficulty levels.
    selectUpBtn.addEventListener('click', () => {
        switch (levelLabel.textContent) {
            case 'EASY':
                levelLabel.textContent = "MEDIUM";
                break;
            case 'MEDIUM':
                levelLabel.textContent = "HARD";
                break;
            case 'HARD':
                levelLabel.textContent = "EXPERT";
                break;
            case 'EXPERT': 
                levelLabel.textContent = "EASY"; 
        }
    });



    selectDownBtn.addEventListener('click', () => {
        switch (levelLabel.textContent) {
            case 'EASY':
                levelLabel.textContent = "EXPERT";
                break;
            case 'MEDIUM':
                levelLabel.textContent = "EASY";
                break;
            case 'HARD':
                levelLabel.textContent = "MEDIUM";
                break;
            case 'EXPERT': 
                levelLabel.textContent = "HARD";
        }
    });



    playBtn.addEventListener('click', () => {
        switch (levelLabel.textContent) {
            case 'EASY':
                startGame(10, 90);
                break;
            case 'MEDIUM':
                startGame(10, 90);
                break;
            case 'HARD':
                grid.classList.remove('grid');
                grid.classList.add('grid-large');
                settingsDiv.classList.remove('settings');
                settingsDiv.classList.add('settings-large'); 
                scoreDiv.classList.remove('score');
                scoreDiv.classList.add('score-large'); 
                startGame(15, 120);
                break; 
            case 'EXPERT':
                grid.classList.remove('grid');
                grid.classList.add('grid-expert');
                settingsDiv.classList.remove('settings');
                settingsDiv.classList.add('settings-expert'); 
                scoreDiv.classList.remove('score');
                scoreDiv.classList.add('score-expert');
                startGame(20, 150);
        }
        startScreen.remove();
        playBtn.disabled = true;
        selectDownBtn.disabled = true;
        selectUpBtn.disabled = true;
        resetBtn.disabled = false;
        resetPressed = false;
    });


    /*************************
     * RESET BUTTON***********
     *************************/
    resetBtn.addEventListener('click', () => {
        resetBtn.disabled = true;     
        resetPressed = true;

        if (endReached){
            grid.removeChild(scoreCardContainer);
            document.getElementById('score-label').textContent = `Score: 0`;
            document.getElementById('timer-label').textContent = `Time: 0`; 
            endReached = false;
        } else {
            let cardsOnGrid = document.querySelectorAll('#game-grid > img');
            cardsOnGrid.forEach((img) => img.remove()); 
        }
        
        grid.appendChild(startScreen);
        cardsList = [];
        chosenCards = []; 
        totalScore = 0;
        attempts = 0;
        matched = 0;
        seconds = 1; 

        levelLabel.textContent = "MEDIUM";

        // if grid is large or expert then reset to original size. 
        if (!(grid.classList.contains('grid'))){
            /* if class is not found then nothing happens,
                so remove both large and expert together, despite only
                one being removed. */
            grid.classList.remove('grid-large', 'grid-expert');
            grid.classList.add('grid');
            settingsDiv.classList.remove('settings-large', 'settings-expert');
            settingsDiv.classList.add('settings'); 
            scoreDiv.classList.remove('score-large', 'score-expert');
            scoreDiv.classList.add('score');

        }
        playBtn.disabled = false;
        selectUpBtn.disabled = false;
        selectDownBtn.disabled = false; 
    });



    function startGame(cardsLength, secs) {
        // populate the cardsList with name/img using for of loop and objects. 
        for (let p of CARD_NAMES.slice(0, cardsLength)){
            let obj = {
                name: p.split('.')[0],
                img: 'images/' + p
            }
    
            cardsList.push(obj); 
            cardsList.push(obj); 
        }

        // have to clone cardsList as console.log takes the array by reference.
        // thus, printing without cloning would only print the final value of the array.
        console.log("before shuffling:\n", JSON.parse(JSON.stringify(cardsList)));
        cardsListShuffled(cardsList);
        console.log("after shuffling:\n", cardsList);
        solver(cardsLength);
        createGameGrid();
        seconds = secs;
        countdownTimer();
    }



    function endGame(currLevel) {
        let cardsOnGrid = document.querySelectorAll('#game-grid > img'); 
        cardsOnGrid.forEach((img) => img.remove()); 
 
        let scoreCard = document.createElement('div');
        let scoreCardInputs = document.createElement('div');
        let title = document.createElement('h1');
        let nameInput = document.createElement('input');
        let submitScoreBtn = document.createElement('button');
        let scoreTable = document.createElement('table');
        let scoreTableHead = document.createElement('thead'); 
        let scoreTableBody = document.createElement('tbody'); 
        let scoreHeadRow = document.createElement('tr');
        let scoreHeadName = document.createElement('th');
        let scoreHeadScore = document.createElement('th'); 
        let scoreHeadDate = document.createElement('th'); 
        let scoreHeadLevel = document.createElement('th');

        title.textContent = "SCORES";
        nameInput.type = "text"; 
        nameInput.placeholder = "ENTER YOUR NAME";
        nameInput.maxLength = 20;
        submitScoreBtn.type = "button";
        submitScoreBtn.textContent = "SUBMIT SCORE";
        scoreHeadName.textContent = "NAME";
        scoreHeadScore.textContent = "SCORE"; 
        scoreHeadDate.textContent = "DATE";
        scoreHeadLevel.textContent = "LEVEL";

        // if grid size is large or expert change back to original size
        if (!(grid.classList.contains('grid'))){
            grid.classList.remove('grid-large', 'grid-expert');
            grid.classList.add('grid');
            settingsDiv.classList.remove('settings-large', 'settings-expert');
            settingsDiv.classList.add('settings'); 
            scoreDiv.classList.remove('score-large', 'score-expert');
            scoreDiv.classList.add('score');
        }

        scoreCardContainer.classList.add('end-screen'); 
        scoreCard.classList.add('score-card');
        scoreCardInputs.classList.add('score-card-settings');
        nameInput.classList.add('name-input');
        submitScoreBtn.classList.add('submit-score'); 
        scoreTable.classList.add('score-table');

        grid.appendChild(scoreCardContainer);
        scoreCardContainer.appendChild(title);
        scoreCardContainer.appendChild(scoreCardInputs);
        scoreCardContainer.appendChild(scoreCard); 
        scoreCardInputs.appendChild(nameInput);
        scoreCardInputs.appendChild(submitScoreBtn);
        scoreCard.appendChild(scoreTable); 

        // Build score table 
        scoreTable.appendChild(scoreTableHead); 
        scoreTable.appendChild(scoreTableBody); 
        scoreTableHead.appendChild(scoreHeadRow); 
        scoreHeadRow.appendChild(scoreHeadName);
        scoreHeadRow.appendChild(scoreHeadScore); 
        scoreHeadRow.appendChild(scoreHeadLevel);
        scoreHeadRow.appendChild(scoreHeadDate);
        

        function displayScores(){

            let scores = sortScores();
            for (let i=0; i < scores.length; i++){
                let key = localStorage.key(scores[i].index); 
                let scoreObj = JSON.parse(localStorage.getItem(key));
            
                // create row and table data and add to score table
                let row = document.createElement('tr');
                let name = document.createElement('td');
                let score = document.createElement('td');
                let level = document.createElement('td');
                let date = document.createElement('td');
    
                name.textContent = scoreObj.name.toString();
                score.textContent = scoreObj.score.toString();
                level.textContent = scoreObj.level.toString();
                date.textContent = scoreObj.date.toString();
    
                row.append(name, score, level, date);
                scoreTableBody.appendChild(row);
            }
            // for (let i=0; i < localStorage.length; i++){
            //     let key = localStorage.key(i);
            //     if (key !== SCORE_ID_KEY){
            //         let scoreObj = JSON.parse(localStorage.getItem(key));
        
            //         // create row and table data and add to score table
            //         let row = document.createElement('tr');
            //         let name = document.createElement('td');
            //         let score = document.createElement('td');
            //         let level = document.createElement('td');
            //         let date = document.createElement('td');
        
            //         name.textContent = scoreObj.name.toString();
            //         score.textContent = scoreObj.score.toString();
            //         level.textContent = scoreObj.level.toString();
            //         date.textContent = scoreObj.date.toString();
        
            //         row.append(name, score, level, date);
            //         scoreTableBody.appendChild(row);
            //     }
            // } 
        }

        // display all scores if there is scores stored in localStorage.
        // otherwise display message to add score.
        if (localStorage.length > 1){
            displayScores();
        } else {
            scoreCardContainer.removeChild(scoreCard);
            // used var to make notice available to the submitButton eventListener
            var notice = document.createElement('span');
            notice.textContent = "ENTER A NAME AND PRESS SUBMIT TO ADD SCORE TO THE TABLE";
            scoreCardContainer.appendChild(notice);
        }
    

        // event listener for button to add score to score table
        submitScoreBtn.addEventListener('click', () => {
            if (nameInput.value === ''){
                nameInput.placeholder = "PLEASE ENTER A NAME!"
                nameInput.classList.add('nameValidation');
            } else {
                // if this is first score added, remove notice and build table
                if (localStorage.length === 1){
                    scoreCardContainer.removeChild(notice);
                    scoreCardContainer.appendChild(scoreCard);
                    //displayScores();
                }
                // add newly submitted score to the table
                let currentDate = new Date(); 
                let date = `${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getFullYear()}`;
                addScore(nameInput.value, totalScore, currLevel, date);

                let newRow = document.createElement('tr');
                let newName = document.createElement('td');
                let newScore = document.createElement('td');
                let newLevel = document.createElement('td');
                let newDate = document.createElement('td');

                newName.textContent = nameInput.value.toString();
                newScore.textContent = totalScore.toString();
                newLevel.textContent = currLevel; 
                newDate.textContent = date;

                newRow.append(newName, newScore, newLevel, newDate);
                scoreTableBody.appendChild(newRow);

                scoreCardContainer.removeChild(scoreCardInputs);

                scoreCard.classList.remove('score-card'); 
                scoreCard.classList.add('score-card-after-submit');
            }
        });

        
    }



    // saves name, date, and score in localStorage
    function addScore(name, score, level, date) {
        let scoreObj = {
            name: name,
            score: score,
            level: level,
            date: date
        };
        // increment SCORE_ID_KEY to obtain unique key for new score.
        let key = parseInt(localStorage.getItem(SCORE_ID_KEY)) + 1; 
        // update value of SCORE_ID_KEY.
        localStorage.setItem(SCORE_ID_KEY, key); 
        localStorage.setItem(key, JSON.stringify(scoreObj));
    }


    // sort scores by descending order
    function sortScores(){
        scores = []; 
        
        // put all score objects into scores array with index property
        // to relate back to location of the object in localStorage.
        for (let i=0; i < localStorage.length; i++){
            key = localStorage.key(i); 
            if (key !== SCORE_ID_KEY){
                let scoreObj = JSON.parse(localStorage.getItem(key));
                scoreObj.index = i; 
                scores.push(scoreObj);
            }
        }

        scores.sort((s1, s2) => (parseInt(s1.score) < parseInt(s2.score)? 1 : (parseInt(s1.score) > parseInt(s2.score)) ? -1 : 0));

        return scores;
    }




    function solver(numOfCards){
        let shuffled = cardsList.map(img => img.name);
        for (let i=0; i < numOfCards; i++){
            let name = CARD_NAMES[i].split('.')[0];
            let first = shuffled.indexOf(name);
            let second = shuffled.lastIndexOf(name);
            console.log(`${name}: ${first + 1}, ${second + 1}`); 
        }
    }



    // algorithm to randomly shuffle the cardList
    function cardsListShuffled(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
    


    // create and populate game board
    function createGameGrid(){
        for (let i = 0; i < cardsList.length; i++){
            let card = document.createElement('img');
            card.src = 'images/pokeball.png';
            card.setAttribute('cardID', i);
            card.addEventListener('click', cardFlip);
            grid.appendChild(card);
        }
    }



    
    function countdownTimer() {
        let timerLabel = document.getElementById("timer-label"); 
        timerLabel.textContent = `Time: ${seconds}`;
        let interval = setInterval(() => {
            seconds--; 
            timerLabel.textContent = `Time: ${seconds}`;

            // GAME OVER 
            if (seconds === 0 || matched === (cardsList.length / 2)){
                // bonus points if time leftover after all cards matched
                totalScore += (seconds * 10);
                updateScore(seconds);
                clearInterval(interval);
                if (!resetPressed){
                    endReached = true;
                    endGame(levelLabel.textContent);
                }
            }
        }, 1000);
    }


    /* 
        SCORE = MATCHED/ATTEMPTS * SECONDS_LEFT
        1 attempt = opening 2 cards OR clicking on 1 card twice.
    */
    function updateScore(secondsLeft) {
        if (attempts > 0 && seconds > 0){
            let score = Math.floor(((matched / attempts) * 5) * secondsLeft);
            totalScore += score;
        }
        document.getElementById('score-label').textContent = `Score: ${totalScore}`; 
    }



    // event listener for when cards are clicked. 
    function cardFlip(){

        //this.classList.add('card-flip-animation');
        this.src = cardsList[this.getAttribute('cardID')].img; 
        chosenCards.push(this.getAttribute('cardID'));
        let cardsOnGrid = document.querySelectorAll('#game-grid > img');

        // chosenCards contains the cardIDs of the 2 cards clicked on.
        if (chosenCards.length === 2){
            // add css class to stop clicking on cards until check for match is complete. 
            cardsOnGrid.forEach((card) => card.classList.add('img-no-click'));
            attempts++;

            setTimeout(() => {
                // chosenCard_1 and chosenCard_2 are objects containing
                // the name and img source of the face card. 
                let chosenCard_1 = cardsList[chosenCards[0]]; 
                let chosenCard_2 = cardsList[chosenCards[1]];
                /*
                    if the names of the cards are the same AND if the ids are different 
                    then it is a match. IDs have to be different as double clicking on the 
                    same card is a match if IDs are not checked for being different. 
                */
                if ((chosenCard_1.name === chosenCard_2.name) && (chosenCards[0] !== chosenCards[1])){
                    matched++;
                    updateScore(seconds);
                    cardsOnGrid[chosenCards[0]].src = 'images/blank.jpg';
                    cardsOnGrid[chosenCards[1]].src = 'images/blank.jpg';
                    cardsOnGrid[chosenCards[0]].removeEventListener('click', cardFlip);
                    cardsOnGrid[chosenCards[1]].removeEventListener('click', cardFlip);
                    cardsOnGrid[chosenCards[0]].classList.add('matched'); 
                    cardsOnGrid[chosenCards[1]].classList.add('matched'); 

                    chosenCards = []; 
                }
                else {
                    cardsOnGrid[chosenCards[0]].src = 'images/pokeball.png';
                    cardsOnGrid[chosenCards[1]].src = 'images/pokeball.png';

                    chosenCards = [];
                }
            }, 500);

            // enable clicking again
            cardsOnGrid.forEach((card) => card.classList.remove('img-no-click'));

        }
    }
});


