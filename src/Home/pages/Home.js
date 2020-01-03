import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

// Project imports
import Row from '../components/Row';
import TableCell from '../components/TableCell';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import { fetchData } from '../redux/grid';

// styled components
const Header = styled.div`
  width: 100%;
  background-color: white;
  position: fixed;
  top: 0;
`;

const HeaderContent = styled.div`
  margin: 10px auto 0 -10px;
  width: calc(100% - 16px);
  left: 0;
  right: 0;
  padding: 0 10px;
`;

const SSearchBar = styled(SearchBar)`
  width: calc(100% - 35px);
  margin-bottom: 10px;
`;

const Spacer = styled.div`
  height: 120px;
  @media (max-width: 700px) {
    height: 70px;
  }
`;

const HeaderRow = styled(Row).attrs({
  isHeader: true,
})`
  @media (max-width: 700px) {
    display: none;
  }
`;

const MobileHeader = styled(Row)`
  @media (min-width: 700px) {
    display: none;
  }
`;

const IndustryCell = styled(TableCell)`
  align-items: baseline;
`;

const LoadScreen = styled.div`
  width: 100%;
  padding-top: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// render

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

  const nextArr = useRef(null);
  const concatedArr = useRef(null);
  const expander = useRef(null);
  const removalCounter = useRef(0);
  const filtered = useRef(null);
  const lastMoveWasBottom = useRef(true);
  const prevInitIndex = useRef(null);

  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch]);

  useEffect(() => {
    nextArr.current = data.slice(initIndex, finalIndex);
    filtered.current = data;
    sliceList(nextArr.current);
    createIntersectionObserver();
    // this effect depends exclusively on the data being loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (filter.length !== 0) {
      filtered.current = data.filter(el => {
        return el.product.toLowerCase().includes(filter.toLowerCase())
          || el.origin.toLowerCase().includes(filter.toLowerCase());
        })
      sliceList(filtered.current, false, true);
    } else {
      filtered.current = data;
      // guard against pre render call
      expander.current && sliceList(filtered.current, false, true);
    }

    // including sliceList in the dependendy array would require a useCallback
    // which would trigger two functions instead of one, losing performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, data])

  useEffect(() => {
    concatedArr.current = currArr;
  })

  function resetPaddings() {
    expander.current.style.paddingBottom = '0px';
    expander.current.style.paddingTop = '0px';
    topSentinelPreviousY = 0;
    bottomSentinelPreviousY = 0;
    return;
  }

  function removeObservers() {
    document.querySelector('.top-observed').style.display = 'none';
    document.querySelector('.bottom-observed').style.display = 'none';
  }

  function restoreObservers() {
    document.querySelector('.top-observed').style.display = 'block';
    document.querySelector('.bottom-observed').style.display = 'block';
  }

  function sliceList(list, isBottom, isFilter) {
    if (!isBottom && initIndex === prevInitIndex.current && !isFilter) {
      return;
    }

    const listLength = list.length;
    if (isFilter) {
      resetPaddings();
      // reset scroll
      window.scrollTo(0, 0);
      if (listLength <= initArrLength) {
        removeObservers();
        setCurrArr(list.slice(initIndex, finalIndex));
      } else {
        restoreObservers();
        setCurrArr(list.slice(0, initArrLength));
      }
      removalCounter.current = 0;
      return;
    }

    finalIndex = finalIndex >= listLength ? finalIndex : listLength;
    if (removalCounter.current === 0 && concatedArr.current && concatedArr.current.length < maxArrLength) {
      setCurrArr(arr => arr.concat(list));
    } else if (isBottom && initIndex >= 0) {
      // remove unseen topmost dom elements and append new items
      setCurrArr(arr => arr.slice(initArrLength, finalIndex).concat(list));
    } else {
      // preppend new items and remove unseen bottommost dom elements
      setCurrArr(arr => list.concat(arr.slice(0, initArrLength)));
    }
  }

  function getNewIndexes(isBottom) {
    prevInitIndex.current = initIndex;
    if (isBottom) {
      initIndex = finalIndex
      finalIndex = finalIndex + initArrLength
      nextArr.current = filtered.current.slice(initIndex, finalIndex);
      // check and toggle last move
      if (lastMoveWasBottom.current !== isBottom) lastMoveWasBottom.current = isBottom;
    } else {
      // check last move
      if (lastMoveWasBottom.current !== isBottom) {
        // avoid slicing negative numbers from data array
        initIndex = initIndex - maxArrLength >= 0 ? initIndex - maxArrLength : 0;
        finalIndex = finalIndex - maxArrLength >= initArrLength ? finalIndex - maxArrLength : initArrLength;
        // toggle last move
        lastMoveWasBottom.current = !lastMoveWasBottom.current;
      } else {
        initIndex = initIndex - initArrLength >= 0 ? initIndex - initArrLength : 0;
        finalIndex = finalIndex - initArrLength >= initArrLength ? finalIndex - initArrLength : initArrLength;
      }
    }

    // call sliceList to render new elements
    isBottom
      ? sliceList(nextArr.current, isBottom)
      : sliceList(filtered.current.slice(initIndex, finalIndex), isBottom);
  }

  function shouldGetNewPadding(isBottom) {
    const numberOfDataRows = document.getElementsByClassName('data-row').length;

    // update paddings
    if (numberOfDataRows === maxArrLength) {
      removalCounter.current += 1;
      // add padding to expander element
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
    getNewIndexes(isBottom);
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
      rootMargin: `${rowElementHeight * 8}px`,
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
                placeholder="Search for a product or origin"
              />
            </div>
            <HeaderRow>
              {Object.keys(data[0]).map(el => (
                <TableCell text={el.toUpperCase()} key={el} />
              ))}
            </HeaderRow>
          </HeaderContent>
        </Header>
        <Spacer />
        <div id="expander" ref={expander}>
          {currArr && <div className="top-observed" />}
          <MobileHeader>
            {Object.keys(data[0]).map(el => (
                <TableCell text={el.toUpperCase()} key={el} />
              ))}
          </MobileHeader>
          {currArr && currArr.map(obj => (
            <Row key={obj.product.concat(obj.price)} className="data-row">
              <TableCell text={obj.product} />
              <TableCell text={obj.quantity} />
              <TableCell text={obj.price} />
              <TableCell text={obj.type} />
              <IndustryCell text={obj.industry} />
              <TableCell text={obj.origin} />
            </Row>
          ))}
          {currArr && <div className="bottom-observed" />}
        </div>
      </>
    ) : (
      <LoadScreen>
        <Loader />
      </LoadScreen>
    )
}

export default Home;