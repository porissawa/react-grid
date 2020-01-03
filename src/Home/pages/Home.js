import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

// Project imports
import Row from '../components/Row';
import TableCell from '../components/TableCell';
import SearchBar from '../components/SearchBar';
import { fetchData, setFilter } from '../redux/grid';

// styled components
const Header = styled.div`
  width: 100%;
  background-color: white;
  position: fixed;
  top: 0;

`;

const HeaderContent = styled.div`
  position: sticky;
  margin: 10px auto 0 -10px;
  width: calc(100% - 16px);
  top: 0;
  left: 0;
  right: 0;
  padding: 0 10px;
`;

const SSearchBar = styled(SearchBar)`
  width: 70%;
  margin-bottom: 10px;
`;

const Spacer = styled.div`
  height: 130px;
`;

const Home = () => {
  const dispatch = useDispatch();
  const filter = useSelector(state => state.grid.filter);
  const data = useSelector(state => state.grid.data);
  
  const initArrLength = 100;
  const maxArrLength = initArrLength * 2;
  let initIndex = 0;
  let finalIndex = initArrLength;

  let rowElementHeight = 30; //px

  let topSentinelPreviousY = 0;
  let bottomSentinelPreviousY = 0;

  const [currArr, setCurrArr] = useState([]);
  const [query, setQuery] = useState('');

  const nextArr = useRef(null);
  // const concatedArr = useRef(null); // using for debugging
  const lastInitIndex = useRef(0);
  const expander = useRef(null);
  const removalCounter = useRef(0);
  const filtered = useRef(null);

  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch]);

  useEffect(() => {
    nextArr.current = data.slice(initIndex, finalIndex);
    filtered.current = data;
    sliceList(nextArr.current);
    createIntersectionObserver();
    expander.current = document.getElementById('expander');
    //this effect depends exclusively on the data being loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (filter !== '') {
      filtered.current = data.filter(el => {
        return el.product.toLowerCase().includes(filter.toLowerCase())
          || el.origin.toLowerCase().includes(filter.toLowerCase());
        })
    } else {
      filtered.current = data
    }
    filter && sliceList(filtered.current, false, true);
  }, [filter, data])

  function resetPaddings() {
    expander.current.style.paddingBottom = '0px';
    expander.current.style.paddingTop = '0px';
    topSentinelPreviousY = 0
    bottomSentinelPreviousY = 0
    return
  }

  function sliceList(list, isBottom, isFilter) {
    const listLength = list.length;

    if (isFilter) {
      resetPaddings();
      if (listLength <= initArrLength) {
        document.querySelector('.bottom-observed').style.display = 'none';
        document.querySelector('.top-observed').style.display = 'none';
        setCurrArr(list.slice(initIndex, finalIndex));
      } else {
        document.querySelector('.bottom-observed').style.display = 'block';
        document.querySelector('.top-observed').style.display = 'block';
        setCurrArr(list.slice(0, initArrLength));
      }
      removalCounter.current = 0;
      return;
    }

    finalIndex = finalIndex >= listLength ? finalIndex : listLength;

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
    // calculate initial and final indexes
    if (isBottom) {
      // since appeding items steps in half the step preppeding does,
      // check if last move was a preppend
      initIndex === lastInitIndex.current
        ? initIndex = finalIndex + initArrLength
        : initIndex = finalIndex;
      finalIndex === lastInitIndex.current + initArrLength
        ? finalIndex = finalIndex + maxArrLength
        : finalIndex = finalIndex + initArrLength;

      nextArr.current = filtered.current.slice(initIndex, finalIndex);
    } else {
      // avoid slicing negative numbers from data array
      initIndex = initIndex - maxArrLength >= 0 ? initIndex - maxArrLength : 0;
      finalIndex = finalIndex - maxArrLength >= initArrLength ? finalIndex - maxArrLength : initArrLength;
      lastInitIndex.current = initIndex;
    }
    
    const numberOfDataRows = document.getElementsByClassName('data-row').length;

    // update paddings
    if (numberOfDataRows === maxArrLength) {
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
        if (expander.current.style.paddingBottom === '0px') {
          expander.current.style.paddingTop =`${currPaddingTop - newPadding}px`
        } else {
          expander.current.style.paddingTop = currPaddingTop === 0
          ? '0px'
          : `${currPaddingTop - newPadding}px`
        }
        expander.current.style.paddingBottom = `${currPaddingBottom + newPadding}px`
      }
    } else {
      removalCounter.current = 0;
    }

    // finally, call sliceList to render new elements
    isBottom
      ? sliceList(nextArr.current, isBottom)
      : sliceList(filtered.current.slice(initIndex, finalIndex), isBottom) ;
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
        <Header isHeader>
          <HeaderContent>
            <div>
              <SSearchBar
                onChange={e => setQuery(e.target.value)}
                onSubmit={(e) => {
                  e.preventDefault();
                  dispatch(setFilter(query))
                }}
                value={query}
                placeholder="Search for a product or origin"
                onClear={() => {
                  setQuery('');
                  dispatch(setFilter(''))
                }}
              />
            </div>
            <Row isHeader>
              {Object.keys(data[0]).map(el => (
                <TableCell text={el.toUpperCase()} key={el} />
              ))}
            </Row>
          </HeaderContent>
        </Header>
        <Spacer />
        <div id="expander" ref={expander}>
          {currArr && <div style={{border: "1px solid red"}} className="top-observed" />}
          {currArr && currArr.map(obj => (
            <Row key={obj.product.concat(Math.random())} className="data-row">
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