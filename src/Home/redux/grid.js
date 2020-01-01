const FETCH_REQUEST = 'grid-data/FETCH-REQUEST';
const FETCH_SUCCESS = 'grid-data/FETCH-SUCCESS';
const FETCH_FAILURE = 'grid-data/FETCH-FAILURE';
const SET_FILTER = 'grid-data/SET_FILTER';
const CLEAR_FILTER = 'grid-data/CLEAR_FILTER';

const initialState = {
  isFetching: false,
  error: '',
  data: [],
  filters: {
    product: '',
    price: '',
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_REQUEST:
      return {
        ...state,
        isFetching: true,
        error: '',
      }
    case FETCH_SUCCESS:
      return {
        ...state,
        isFetching: false,
        error: '',
        data: action.response,
      }
    case FETCH_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      }
    case SET_FILTER: {
      return {
        ...state,
        isFetching: false,
        error: '',
        filters: {
          ...action.response
        }
      }
    }
    case CLEAR_FILTER: {
      return {
        ...state,
        isFetching: false,
        error: '',
        filters: initialState.filters,
      }
    }
    default:
      return state;
  }
}

function fetchRequest() {
  return { type: FETCH_REQUEST };
}
function fetchSuccess(response) {
  return {
    type: FETCH_SUCCESS,
    response,
  };
}
function fetchFailure(error) {
  return {
    type: FETCH_FAILURE,
    error,
  };
}

export function fetchData() {
  return async (dispatch) => {
    dispatch(fetchRequest());

    try {
      let response;

      await fetch('./data_full.json', { mode: 'no-cors' })
      .then(res => res.json()
      .then(data => response = data));

      dispatch(fetchSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(fetchFailure(error));
      throw error;
    }
  }
}