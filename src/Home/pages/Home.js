import React from 'react';
import { useDispatch } from 'react-redux';

import { fetchData } from '../redux/grid';

const Home = () => {
  const dispatch = useDispatch();

  console.time();
    dispatch(fetchData())
  console.timeEnd();
  return (
    <div>Home page</div>
  )
}

export default Home;