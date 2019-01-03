$(document).ready(function () {

});

function Player(name, keys) {
    this.name = name;
    this.puan = 0;
    this.correct = [];
    this.false = [];
    this.answered = {};
    this.unanswered = [];
    this.keys = keys;
    this.questionsAsked = [];
    this.answer = function (question, question_answer, guess) {

        if (this.questionsAsked[this.questionsAsked.length - 1] && this.questionsAsked[this.questionsAsked.length - 1].question == question) {
            this.questionsAsked[this.questionsAsked.length - 1] = {
                question: question,
                question_answer: question_answer,
                guess: guess,
                answerTime: Game.timerMilliseconds
            };
        } else {
            this.questionsAsked.push({
                question: question,
                question_answer: question_answer,
                guess: guess,
                answerTime: Game.timerMilliseconds
            });
        }
        console.log(this.name, 'says', question_answer, 'is', guess);
    }.bind(this);
    this.listen = function () {
        // -------
        var _this = this;
        window.addEventListener('keyup', function (e) {
            if (Game.answering_on != true) return 0;
            var key = e.key.toUpperCase();
            var question = Object.values(Game.questions)[Game.currentQuestion];
            var options = Object.values(Game.options)[Game.currentQuestion];
            var answer = Object.values(Game.answers)[Game.currentQuestion];
            if (key == _this.keys[0].toUpperCase()) {
                $('.player-selection')
                    .filter(function (i, e) {
                        return e.textContent.indexOf(_this.name) != -1
                    })
                    .css('visibility', 'hidden');
                $('.option')
                    .filter(function (i, e) {
                        return e.innerText.indexOf(options[0]) != -1
                    })
                    .parent().find('.player-selection')
                    .filter(function (i, e) {
                        return e.textContent.indexOf(_this.name) != -1
                    })
                    .css('visibility', 'visible');
                _this.answer(question, answer, options[0]); // soru, cevap, verilen cevap

            } else if (key == _this.keys[1].toUpperCase()) {

                $('.player-selection')
                    .filter(function (i, e) {
                        return e.textContent.indexOf(_this.name) != -1
                    })
                    .css('visibility', 'hidden');
                $('.option')
                    .filter(function (i, e) {
                        return e.innerText.indexOf(options[1]) != -1
                    })
                    .parent().find('.player-selection')
                    .filter(function (i, e) {
                        return e.textContent.indexOf(_this.name) != -1
                    })
                    .css('visibility', 'visible');
                _this.answer(question, answer, options[1]);

            }
            
        })
        // -------
    }.bind(this);
    this.calculateResults = function () {
        this.correct = this.questionsAsked.filter(function (question) {
            return question.question_answer == question.guess
        });
        this.false = this.questionsAsked.filter(function (question) {
            return question.question_answer != question.guess
        });
        this.unanswered = Object.keys(Game.questions).length - this.questionsAsked.length;
        var correct_times = this.correct.map(function (true_question) {
            return true_question.answerTime
        })
        this.total = correct_times.length ? correct_times.reduce(function (a, b) {
            return a + b
        }) : 0;
    }.bind(this);

    this.outputResults = function () {
        this.calculateResults();
        return '<div class="player-result">' +
            '<h2>' + this.name + '</h2>' +
            '<p>Correct: ' + this.correct.length + '</p>' +
            '<p>Incorrect: ' + this.false.length + '</p>' +
            '<p>Unanswered: ' + this.unanswered + '</p>' +
            '<p>Total: ' + this.total + '</p>' +
            '</div>';
    }.bind(this);
    this.reset = function () {
        this.puan = 0;
        this.correct = [];
        this.false = [];
        this.answered = {};
        this.unanswered = [];
        this.questionsAsked = [];
    }.bind(this);
    return this;
}

var Game = {
    currentQuestion: 0,
    timer: null,
    timerMilliseconds: null,
    timerId: null,
    $container: $(`#game-1`),
    answering_on: false,
    startGame: function (player1, player2) {
        Game.currentQuestion = 0;
        clearInterval(Game.timerId);
        Game.$container.find('.game').show();

        Game.$container.find('.results').html('');
        Game.$container.find('.timer').text(Game.timerMilliseconds);
        Game.$container.find('.start').hide();
        Game.$container.find('.kamera').hide();
        Game.$container.find('.remaining-time').show();
        Game.player1 = player1;
        Game.player2 = player2;

        Game.player1.listen();
        Game.player2.listen();

        Game.nextQuestion();
    },
    endGame: function () {
        Game.answering_on = false;
        clearInterval(Game.timerId);
        Game.$container.find('.results')
            .html('<h3 class="end-game">Thank you for playing!</h3>' + Game.player1.outputResults() + Game.player2.outputResults() + '<p>Please play again!</p>');
        Game.$container.find('.game').hide();
        Game.player1.reset();
        Game.player2.reset();
        
    },

 

    nextQuestion: function () {
        Game.answering_on = true;
        Game.timerMilliseconds = 1000;
        Game.$container.find('.timer').removeClass('last-seconds');
        Game.$container.find('.timer').text(Game.timer);
        // bu timerRunning her saniye execute olacak
        Game.timerId = setInterval(Game.timerRunning, 10);
        // soru metni
        var questionContent = Object.values(Game.questions)[Game.currentQuestion];
        // soru metni render
        Game.$container.find('.question').text(questionContent);
        // seçenekler
        var questionOptions = Object.values(Game.options)[Game.currentQuestion];

        // seçenekler render
        $.each(questionOptions, function (index, key) {
            Game.$container.find('.options').append($('<div class="opt-container"> <div class="player-selection"> ' + Game.player1.name + ' </div>  <button class="option btn btn-info btn-lg">  <span class="val">' + key + '</span></button> <div class="player-selection"> ' + Game.player2.name + ' </div> </div>'));
        })
    },
    timerRunning: function () {
        // zaman geçiyor
        Game.timerMilliseconds -= 10;
        // zamanı render ediyoruz
        Game.$container.find('.timer').text(Math.round(Game.timerMilliseconds / 100) / 10);
        if (Game.timerMilliseconds > -1 && Game.currentQuestion < Object.keys(Game.questions).length) {
            if (Game.timerMilliseconds === 4000) {
                Game.$container.find('.timer').addClass('last-seconds');
            }
        }
        if (Game.timerMilliseconds <= 0) {
            // zaman saniye doldu
            Game.result = false;
            clearInterval(Game.timerId);
            Game.$container.find('.results').html('<h3>Out of time! The answer was ' + Object.values(Game.answers)[Game.currentQuestion] + '</h3>');

            Game.currentQuestion++
            Game.answering_on = false;
            setTimeout(function () {
                Game.$container.find('.opt-container').remove();
                Game.$container.find('.results h3').remove();
                Game.nextQuestion();
            }, 1500);
        } else if (Game.currentQuestion === Object.keys(Game.questions).length) {
            // Son soru
            Game.endGame();
        }
    },
    loadQuestions: function (question_data) {
        Game.questions = question_data.questions;
        Game.options = question_data.options;
        Game.answers = question_data.answers;

    }
}

var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {       
    navigator.mediaDevices.getUserMedia({video: true})
  .then(function(stream) {
    video.srcObject = stream;
  })
  .catch(function(err0r) {
    console.log("Something went wrong!");
  });
}

// ********************* **************************** ************************** *******
var yusuf = new Player('yusuf', ['a', 's']);
var ali = new Player('ali', ['d', 'w']);
Game.$container.find(".remaining-time").hide();
Game.$container.find(".start").on('click', function () {
    Game.startGame(ali, yusuf)
});
var question_data = {
    questions: {
        q1: 'Uzay Kimdir ?',
    },
    options: {
        q1: ['Müzisyen', 'Mühendis'],
    },
    answers: {
        q1: 'Mühendis',

    }
};
Game.loadQuestions(question_data);
$(window).on('keyup', function (e) {
    if (Game.$container.find(".start").is(':visible')) {
        e.preventDefault();
        Game.$container.find(".start").click();
    }
    if (Game.$container.find(".end-game").is('*')) {
        Game.$container.find('.results').hide('');
        Game.$container.find('.remaining-time').hide();
        Game.$container.find('.question').hide('');
        Game.$container.find('.game').hide();
        Game.$container.find('.kamera').show();
    }
    if (Game.$container.find(".kamera").is('*')) {
        Game.$container.find('.game').show();


    }     
});

