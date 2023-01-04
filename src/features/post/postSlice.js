import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";
import {sub} from "date-fns";
import axios from "axios";

const POSTS_URL='https://jsonplaceholder.typicode.com/posts';

const initialState = {
  posts: [],
  status: 'idle',//'loading','succeeded','failed'
  error: null
}

//async thunk
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(POSTS_URL);
  return response.data;
});

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost) => {
  const response = await axios.post(POSTS_URL, initialPost);
  return response.data;
});

const postsSlice = createSlice({
  name:'posts',
  initialState,
  reducers:{
    // postAdd: {
    //   reducer(state,action) {
    //     state.posts.push(action.payload)
    //   },
    //   prepare(title,content, userId) {
    //     return {
    //       payload: {
    //         id: nanoid(),
    //         title, 
    //         content, 
    //         userId,
    //         date: new Date().toISOString(),
    //         reactions: {
    //           thumb: 0,
    //           wow: 0,
    //           heart: 0,
    //           rocket: 0,
    //           coffee: 0
    //         }
    //       }
    //     }
    //   },
    // }, 
    reactionAdd: (state, action) => {
      const {postId, reactionName} = action.payload;
      const isPostExist = state.posts.find(post => post.id === postId);
      if(isPostExist) isPostExist.reactions[reactionName]++
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state,action) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state,action) => {
        state.status = 'succeeded';
        //add date and reaction
        let min = 1;
        const loadedPosts = action.payload.map(post => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString()
          post.reactions = {
            thumb: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post;
        });

        //add fetched posts to the array
        state.posts = state.posts.concat(loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        //START fix for fake API post IDs 
        const sortedPosts = state.posts.sort((a,b) => {
          if(a.id > b.id) return 1 
          if(a.id < b.id) return -1
          return 0 
        })
        action.payload.id = sortedPosts[sortedPosts.length-1].id + 1
        //End fix for fake API post IDs 

        action.payload.userId = Number(action.payload.userId);
        action.payload.date = new Date().toISOString();
        action.payload.reactions = {
          thumb: 0,
          wow: 0,
          heart: 0,
          rocket: 0,
          coffee: 0
        }
        state.posts.push(action.payload);
      })
  }
});

export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const { postAdd, reactionAdd } = postsSlice.actions

export default postsSlice.reducer