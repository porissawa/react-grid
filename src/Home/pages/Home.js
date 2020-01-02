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
  let expanderBottomPadding = '0px';
  let rowElementHeight = 30; //px

  let topSentinelPreviousY = 0;
  let bottomSentinelPreviousY = 0;

  const [currArr, setCurrArr] = useState([]);
  const nextArr = useRef(null);
  const concatedArr = useRef(null); // using for debugging
  const lastInitIndex = useRef(0);
  const expander = useRef(null);
  const removalCounter = useRef(0);

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

  useEffect(() => {
    concatedArr.current = currArr;
    // console.log('concatedArr', concatedArr.current)
  })

  function sliceList(list, isBottom) {
    if (removalCounter.current === 0) {
      setCurrArr(arr => arr.concat(list));
    } else if (isBottom && initIndex >= 0) {
      // remove unseen topmost dom elements and append new items
      setCurrArr(arr => arr.slice(initArrLength, finalIndex).concat(list));
    } else {
      // preppend new items and remove unseen bottommost dom elements
      setCurrArr(arr => list.concat(arr.slice(0, initArrLength)));
    }
  }

  // add top padding to #expander div
  function shouldGetNewPadding(isBottom) {
    if (isBottom) {
      // since preppeding items steps in half the step appeding does,
      // check if last move was a preppend
      initIndex === lastInitIndex.current
        ? initIndex = finalIndex + initArrLength
        : initIndex = finalIndex;
      finalIndex === lastInitIndex.current + initArrLength
        ? finalIndex = finalIndex + initArrLength * 2
        : finalIndex = finalIndex + initArrLength;

      nextArr.current = data.slice(initIndex, finalIndex);
    } else {
      // avoid slicing negative numbers from data array
      initIndex = initIndex - initArrLength * 2 >= 0 ? initIndex - initArrLength * 2 : 0;
      finalIndex = finalIndex - initArrLength * 2 >= initArrLength ? finalIndex - initArrLength * 2 : initArrLength;
      console.log('not is bottom', initIndex, finalIndex);
      lastInitIndex.current = initIndex;
    }
    
    const numberOfDataRows = document.getElementsByClassName('data-row').length;

    if (numberOfDataRows === initArrLength * 2) {
      removalCounter.current += 1;
      // add padding to top element
      const currPaddingTop = Number(expander.current.style.paddingTop.split('p')[0]);
      const currPaddingBottom = Number(expander.current.style.paddingBottom.split('p')[0]);
      const newPadding = initArrLength * rowElementHeight;

      if (isBottom) {
        expander.current.style.paddingBottom = currPaddingBottom === 0
          ? '0px'
          : `${currPaddingBottom - newPadding}px`;
        expander.current.style.paddingTop = `${currPaddingTop + newPadding}px`;
        
      } else {
        expander.current.style.paddingTop = currPaddingTop === 0
          ? '0px'
          : `${currPaddingTop - newPadding}px`
        expander.current.style.paddingBottom = `${currPaddingBottom + newPadding}px`
        
      }
      // expanderTopPadding = isBottom ? `${currPaddingTop + newPadding}px` : `${currPaddingTop - newPadding}px`;
      // expanderBottomPadding = isBottom ? `${currPadding - newPadding}px` : `${currPadding + newPadding}px`;

      // expander.current.style.paddingTop = expanderTopPadding;
      // expander.current.style.paddingBottom = expanderBottomPadding;
    } else {
      removalCounter.current = 0;
    }

    isBottom ? sliceList(nextArr.current, isBottom) : sliceList(data.slice(initIndex, finalIndex), isBottom) ;
  }

  function bottomCallback(entry) {  
    const currentY = entry.boundingClientRect.y + window.pageYOffset;
    const isIntersecting = entry.isIntersecting;
    
    if (currentY > bottomSentinelPreviousY && isIntersecting) {
      shouldGetNewPadding(true);
    }
    console.log('bottomCallback currentY', currentY);
    bottomSentinelPreviousY = currentY;
    topSentinelPreviousY = currentY;
  }

  function topCallback(entry) {
    const currentY = entry.boundingClientRect.y + window.pageYOffset;
    const isIntersecting = entry.isIntersecting;

    if (currentY < topSentinelPreviousY && isIntersecting) {
      shouldGetNewPadding(false);
    }

    console.log('topCallback currentY', currentY);
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
            // to avoid triggering effect on page load
            return entries.find(el => el.target.className === 'top-observed')
              ? null
              : observer.observe(document.querySelector('.top-observed'));
          } else {
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