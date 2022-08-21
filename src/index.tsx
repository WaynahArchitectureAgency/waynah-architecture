import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Research from './components/pages/Reasearch';
import Team from './components/pages/Team';
import News from './components/pages/News';
import Projects from './components/pages/Projects';
import './index.css';
import HomePage from './components/pages/HomePage';
import CreatePost from './components/pages/admin/CreatePost';
import Profile from './components/pages/admin/Profile';
import MyPost from './components/pages/admin/MyPost';
import { Amplify } from 'aws-amplify';
import 'easymde/dist/easymde.min.css';
import config from './aws-exports';

Amplify.configure(config);

const routing = (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="project" element={<Projects />} />
      <Route path="research" element={<Research />} />
      <Route path="team" element={<Team />} />
      <Route path="news" element={<News />} />
      <Route path="profile" element={<Profile />} />
      <Route path="createpost" element={<CreatePost />} />
      <Route path="mypost" element={<MyPost />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.render(routing, document.getElementById('root'));
