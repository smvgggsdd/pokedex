import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import icon from './pokeheader.png';

function Avatar(props) {
  return (
    <img className="Avatar"
      src={props.src}
      alt={props.name} 
    />
  );
}

function Header(props) {
  return (
    <header>
      <img src={icon} alt="icon" className="icon"/>
      <h1 className="site-header">Pokedex</h1>
    </header>
  )
}

function Footer(props) {
  return (
    <footer>
      <div>
        Matt McKenna 2021
      </div>
    </footer>
  )
}

function Title(props) {
  return (
    <div className="Title">
      {props.id}
      {props.types.map(type =>
      <Type type={type} />)}
    </div>
  )
}

function Type(props) {
  return (
    <span className={`Type background-color-${props.type}`}>
      {capitalize(props.type)}
    </span>
  )
}

function Name(props) {
  return (
    <div className="Name">
      {props.name} 
    </div>
  )
}

function GenerationSelect(props) {
  return (
    <div>
      <label htmlFor="Generation">Generation: </label>
      <select  onChange={props.onChange} id="Generation" name="Generation">
        <option value="I">I</option>
        <option value="II">II</option>
        <option value="III">III</option>
        <option value="IV">IV</option>
        <option value="V">V</option>
        <option value="VI">VI</option>
        <option value="VII">VII</option>
        <option value="VIII">VIII</option>
      </select>
    </div>
  )
}

function PokemonSearch(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <label>
        Search For Pokemon By Name or National Pokedex Number
        <input type="text" name="PokemonSearch" value={props.value} onChange={props.onChange}/>
      </label>
      <input type="submit" value="Search" />
    </form>
  )
}

class Pokecard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      name: this.props.name,
      url: this.props.url,
      image: "",
      types: [],
    }
  }

  componentDidMount() {
    if (localStorage.getItem(`${this.props.name}-id`)) {
      let id = localStorage.getItem(`${this.props.name}-id`);
      let sprite = localStorage.getItem(`${this.props.name}-sprite`);
      let typestring = localStorage.getItem(`${this.props.name}-types`);
      const types = typestring.split(",");
      this.setState({
        id: id,
        image: sprite,
        types: types,
      })
    } else {
      console.log('hi');
      fetch(this.state.url)
        .then(response => response.json())
        .then(
          (result) => {
            const id = formatNumber(result.id);
            const sprite = result.sprites.other["official-artwork"].front_default;
            const types = [];
            result.types.forEach((type) => {
              types.push(type.type.name);
            })
            // cache pokemon info
            localStorage.setItem(`${this.props.name}-id`, id);
            localStorage.setItem(`${this.props.name}-sprite`, sprite);
            localStorage.setItem(`${this.props.name}-types`, types);
            this.setState({
              id: id,
              image: sprite,
              types: types,
            })
          }
        )
      }
  }
  

  render() {
    const state = this.state;
    return (
      <div className="pokecard">
        <Title id={state.id} types={state.types}/>
        <Avatar src={state.image} alt={state.id} />
        <Name name={state.name} />
      </div>
    )
  }
}

class Pokedex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      limit: 151,
      offset: 0,
      view: "default",
      type: "",
      pokemon: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.state.limit}&offset=${this.state.offset}`)
      .then(response => response.json())
      .then(
        (result) => {
          const newItems = [];
          result = result.results;
          for (let i=0;i<result.length;i++) {
            const pokemon = {
              id: i,
              name: capitalize(result[i].name),
              url: result[i].url,
            }
            newItems.push(pokemon);
          }
          this.setState({
            items: newItems,
          })
        }
      )
    
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.limit !== prevState.limit) {
      fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.state.limit}&offset=${this.state.offset}`)
      .then(response => response.json())
      .then(
        (result) => {
          const newItems = [];
          result = result.results;
          for (let i=0;i<result.length;i++) {
            const pokemon = {
              id: result[i].name,
              name: capitalize(result[i].name),
              url: result[i].url,
            }
            newItems.push(pokemon);
          }
          this.setState({
            items: newItems,
          })
        }
      )
    }
  }

  componentWillUnmount() {
    this.setState = (state,callback) => {
      return;
    };
  }
  handleChange(event) {
    const value = event.target.value;
    if (event.target.name==="Generation") {
      const values = changeGen(value);
      this.setState({
        limit: values.limit,
        offset: values.offset,
      })
    } else if (event.target.name==="PokemonSearch") {
      this.setState({
        pokemon: event.target.value,
      })
    }
    
  }
  handleSubmit(event) {
    // so eventually this will lead to single pokemon view. instead of  
    // using setstate, we're going to render advanced details of searched pokemon
    event.preventDefault();
    const pokemon = this.state.pokemon.toLowerCase();
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        alert('Enter a valid Pokemon/ ID')
        throw new Error('Invalid Pokemon')
      }
    })
    .then(
      (result) => {
        console.log(result);
        const newItems = [];
        const pokemon = {
          id: result.name,
          name: capitalize(result.name),
          url: `https://pokeapi.co/api/v2/pokemon/${this.state.pokemon}`,
        }
          newItems.push(pokemon);
          this.setState({
            items: newItems,
          })
        }
        
    )
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    let pokemon = this.state.items;
    return (
      <div className="page">
        <div className="forms">
          <GenerationSelect onChange={this.handleChange} />
          <PokemonSearch value={this.state.pokemon} onSubmit={this.handleSubmit} onChange={this.handleChange} />
        </div>
        <div className="pokedex">
          {pokemon.map(item => (
            <Pokecard key={item.id} name={item.name} url={item.url} />
          ))}
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div>
      <Header />
      <Pokedex />
      <Footer />
    </div>
  )
}
ReactDOM.render(
  <App />,
  document.getElementById('root')
);

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatNumber(int) {
  let num = int.toString();
  while (num.length < 3) {
    num = "0" + num;
  }
  return `#${num}`
}

function changeGen(int) {
  switch(int) {
    case "I":
      return {limit: 151, offset: 0, }
    case "II":
      return {limit: 100, offset: 151}
    case "III":
      return {limit: 135, offset: 251}
    case "IV":
      return {limit: 107, offset: 386}
    case "V":
      return {limit: 156, offset: 493}
    case "VI":
      return {limit: 72, offset: 649}
    case "VII":
      return {limit: 88, offset: 721}
    case "VIII":
      return {limit: 91, offset: 809}
    default:
      return
  }
}


