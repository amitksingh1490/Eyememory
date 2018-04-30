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
      matches: 0
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
        this.setState({cards, lastCard: null, locked: false, matches: matches + 1});
      } else {
        setTimeout(() => {
          cards[id].flipped = false;
          cards[this.state.lastCard.id].flipped = false;
          this.setState({cards, lastCard: null, locked: false});
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
    if (this.state.matches === this.state.cards.length / 2  && this.state.matches!== 0) {
      btnText = 'You Win! Play Again?';
    }
    return (
      <div className="Game">
        <div>
          <button onClick={this.reset}>{btnText}</button>
        </div>
        {this.renderCards(this.state.cards)}
      </div>
    );
  }
}
