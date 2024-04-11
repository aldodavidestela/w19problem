// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion>{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name)[0];
    
    /*Reduce stock*/
    let newStock = items.map((it) => {
      if (it.name == name && it.instock > 0) {
        it.instock--;
        setCart([...cart, item]);
      }
      console.log(items);
    });
    //setItems(newStock);
    //console.log(`add to Cart ${JSON.stringify(item)}`);
    //setCart([...cart, item]);
    //doFetch(query);
  };
  const deleteCartItem = (index, name) => {
    let newCart = cart.filter((item, i) => index != i);
    
    let newStock = items.map((it) => {
      if (it.name == name) {
        it.instock++;
        setCart(newCart);  
      }
    });

    //setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + Math.floor(1024*Math.random());
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    
    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} | ${item.cost} | Stock: {item.instock}
        </Button>
        <input name={item.name} type="submit" value='+' onClick={addToCart}></input>
      </li>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <div className="accordion-item" key={index}>
        <div className="accordion-header">
          <div className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#clps"+(1+index)} aria-expanded="false" aria-controls={"clps"+(1+index)}>
            {item.name}
          </div>
        </div>

        <div id={"clps"+(1+index)} className="accordion-collapse collapse" data-bs-parent="#accordionExample" onClick={() => deleteCartItem(index, item.name)}>
          <div className="accordion-body">
          $ {item.cost} from {item.country}
          </div>
        </div>
      </div>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    console.log(JSON.stringify(data.data));
    let newItems = data.data.map((item) => {
      let { name, country, cost, instock } = item.attributes;
      return { name, country, cost, instock };
    });
    
    newItems.forEach((itNew) => {
      items.forEach(itm => {
        console.log('itNew: '+itNew.name +'| itm: '+itm.name);
        if (itm.name == itNew.name){
          itm.instock += itNew.instock;
        }
      });
    });
    setItems([...items]);
    
  };

  return (
    <Container>
      <Row>
        <form
          onSubmit={(event) => {
            console.log(`Restock called on ${query}`);
            restockProducts(`${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            style={{width: '300px'}}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
        <hr />
      </Row>
      <Row>
        <Col>
          <h1>Product List</h1>
          <hr />
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <hr />
          <Accordion id="accordionExample">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <hr />
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
