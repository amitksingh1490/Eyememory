import React, {Component} from 'react';
import Card from 'components/Card';
import shuffle from 'lodash/shuffle';

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.renderCards = this.renderCards.bind(this);
    this.checkMatch = this.checkMatch.bind(this);
    this.reset = this.reset.bind(this);
    this.assignPhotos = this.assignPhotos.bind(this);
    this.getPhotos = this.getPhotos.bind(this);

    this.state = {
      cards: [],
      lastCard: null,
      locked: false,
      player1matches: 0,
      player2matches: 0,
      turn: 0
    };
  }

  componentDidMount() {
      this.getPhotos();

  }
  getPhotos() {
      let that = this;
      fetch('https://api.eyeem.com/api/v2/photos/popular?limit=10&offset=0&access_token=wy6volYyqnaiHC/C4CFHa8tdJ/GAJE6U')
          .then(function(response) {
              return response.json();
          })
          .then(function(myJson) {
              that.assignPhotos(myJson.photos.items);
          });
  }
  checkMatch(value, id) {
    if (this.state.locked) {
      return;
    }

    var cards = this.state.cards;
    cards[id].flipped = true;
    this.setState({cards, locked: true});
    if (this.state.lastCard) {
      if (value === this.state.lastCard.value) {
        var matches = this.state.matches;
        cards[id].matched = true;
        cards[this.state.lastCard.id].matched = true;
        if(this.state.turn == 0){
            this.setState({cards, lastCard: null, locked: false, player1matches: this.state.player1matches + 1});
        } else {
            this.setState({cards, lastCard: null, locked: false, player2matches: this.state.player2matches + 1});
        }

      } else {
        setTimeout(() => {
          cards[id].flipped = false;
          cards[this.state.lastCard.id].flipped = false;
          this.setState({cards, lastCard: null, locked: false, turn: !this.state.turn});
        }, 1000);
      }
    } else {
      this.setState({
        lastCard: {id, value},
        locked: false
      });
    }
  }

  renderCards(cards) {
    return cards.map((card, index) => {
      return (
        <Card
          key={index}
          value={card.id}
          url={card.thumbUrl}
          id={index}
          matched={card.matched}
          flipped={card.flipped}
          checkMatch={this.checkMatch} />
      );
    });
  }

  reset() {
      this.getPhotos();
  }
  assignDefaultValues(data){
    return data.map((i)=>{
      return {
        ...i,
        matched: false,
        flipped: false
      }
    })
  }
  assignPhotos(data) {
    this.setState({
      cards: this.assignDefaultValues(shuffle([...data,...data])),
    });
  }

  render() {
    var btnText = 'Reset';
    let matches = this.state.player1matches + this.state.player2matches
    if (matches === this.state.cards.length / 2  && matches!== 0) {
      if(this.state.player1matches === this.state.player2matches) {
          btnText = "It is a Tie! Play Again?"
      } else {
          btnText =  (this.state.player1matches > this.state.player2matches)? 'Player 1 Win! Play Again?': 'Player 2 Win! Play Again?';
      }

    }
    var player = !this.state.turn ? "Player 1" : "Player 2"
    return (
      <div className="Game">
        <div>
          <button onClick={this.reset}>{btnText}</button>
        </div>
        <h1>{`${player} turn`}</h1>
        <div>
          <div>{`Player 1 Score ${this.state.player1matches}`}</div>
          <div>{`    Player 2 Score ${this.state.player2matches}`}</div>
        </div>
        <div>
          {this.renderCards(this.state.cards)}
        </div>
      </div>
    );
  }
}
