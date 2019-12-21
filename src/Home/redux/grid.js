const FETCH_REQUEST = 'grid-data/FETCH-REQUEST';
const FETCH_SUCCESS = 'grid-data/FETCH-SUCCESS';
const FETCH_FAILURE = 'grid-data/FETCH-FAILURE';

const initialState = {
  isFetching: false,
  error: '',
  data: [],
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
      console.log(action.response);
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