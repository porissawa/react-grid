import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

// Project imports
import Row from '../components/Row';
import TableCell from '../components/TableCell';
import { fetchData } from '../redux/grid';

// styled components
const Header = styled(Row)`
  position: fixed;
  margin-bottom: 50px;
`;

const Home = () => {
  const dispatch = useDispatch();
  const data = useSelector(state => state.grid.data);
  // const filters = useSelector(state => state.grid.filters);
  
  const initArrLength = 100;
  let initIndex = 0;
  let finalIndex = initArrLength;

  let expanderTopPadding = '0px';
  let rowElementHeight = 30; //px

  let topSentinelPreviousY = 0;
  let bottomSentinelPreviousY = 0;

  const [currArr, setCurrArr] = useState([]);
  const nextArr = useRef(null);
  const removalCounter = useRef(0);
  const expander = useRef(null);

  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch]);

  useEffect(() => {
    nextArr.current = data.slice(initIndex, finalIndex);
    sliceList(nextArr.current);
    createIntersectionObserver();
    expander.current = document.getElementById('expander');
    //this effect depends exclusively on the data being loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // useEffect(() => {
  //   shouldGetNewTopPadding(true);
  // }, [])

  function sliceList(list, isBottom) {
    if (removalCounter.current === 0) {
      setCurrArr(arr => arr.concat(list));
    } else if (isBottom && initIndex >= 0) {
      // remove unseen far away dom elements
      setCurrArr(arr => arr.slice(initArrLength, finalIndex).concat(list));
    }
  }

  // add top padding to #expander div
  function shouldGetNewPadding(isBottom) {
    if (isBottom) {
      initIndex = finalIndex;
      finalIndex = finalIndex + initArrLength;
      console.log('isBottom', initIndex, finalIndex)
    } else {
      initIndex = initIndex - initArrLength;
      finalIndex = finalIndex - initArrLength;
      console.log('not isBottom', initIndex, finalIndex)
    }
    
    nextArr.current = data.slice(initIndex, finalIndex);
    const numberOfDataRows = document.getElementsByClassName('data-row').length;

    if (numberOfDataRows === initArrLength * 2) {
      removalCounter.current += 1;
      // add padding to top element
      const currPadding = Number(expander.current.style.paddingTop.split('p')[0]);
      const newPadding = initArrLength * rowElementHeight;
      expanderTopPadding = isBottom ? `${currPadding + newPadding}px` : `${currPadding - newPadding}px`;
      expander.current.style.paddingTop = expanderTopPadding;

    }

    sliceList(nextArr.current, true);
  }

  function bottomCallback(entry) {  
    const currentY = entry.boundingClientRect.y + window.pageYOffset;
    const isIntersecting = entry.isIntersecting;
    if (currentY > bottomSentinelPreviousY && isIntersecting) {
      shouldGetNewPadding(true);
    }
        
    bottomSentinelPreviousY = currentY;
    topSentinelPreviousY = currentY;
  }

  function topCallback(entry) {
    const currentY = entry.boundingClientRect.y + window.pageYOffset;
    const isIntersecting = entry.isIntersecting;
    if (currentY < topSentinelPreviousY && isIntersecting) {
      shouldGetNewPadding(false);
    }
    topSentinelPreviousY = currentY;
    bottomSentinelPreviousY = currentY;
  }

  function createIntersectionObserver() {
    let options = {
      rootMargin: `${rowElementHeight * 3}px`,
      threshold: 0.5,
    };

    let callback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.className === 'bottom-observed') {

            bottomCallback(entry);
            // initialize top observer when user hits bottom observer
            return entries.find(el => el.target.className === 'top-observed')
              ? null
              : observer.observe(document.querySelector('.top-observed'));
          }
  
          if (entry.target.className === 'top-observed') {
            topCallback(entry);
          }
        }
      })
    }

    let observer = new IntersectionObserver(callback, options);
    if (document.querySelector('.top-observed')) {
      observer.observe(document.querySelector('.bottom-observed'));
    }
  }

  return data.length > 1
    ? (
      <>
        {/* <Header isHeader>
          {Object.keys(data[0]).map(el => (
            <TableCell text={el.toUpperCase()} key={el} />
          ))}
        </Header> */}
        <div id="expander" ref={expander}>
          {currArr && <div style={{border: "1px solid red"}} className="top-observed" />}
          {currArr && currArr.map(obj => (
            <Row key={obj.product.concat(obj.price)} className="data-row">
              <TableCell text={obj.product} />
              <TableCell text={obj.quantity} />
              <TableCell text={obj.price} />
              <TableCell text={obj.type} />
              <TableCell text={obj.industry} />
              <TableCell text={obj.origin} />
            </Row>
          ))}
          {currArr && <div style={{border: "1px solid red"}} className="bottom-observed" />}
        </div>
      </>
    ) : (
      <>
        {null}
      </>
    )
}

export default Home;