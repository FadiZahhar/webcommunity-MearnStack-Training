import React, {Fragment } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/NavBar';
import Home from './components/pages/Home';
import About from './components/pages/About';

import ContactState from './context/contact/ContactState';
import './App.css';

const App = () => {
  return (
    <ContactState>
    <BrowserRouter>
      <Fragment>
       <Navbar />
       <div className="container">
       <Routes>
          <Route exact path='/' Component={Home} />
          <Route path='/about' Component={About} />
        </Routes>
       </div>
      </Fragment>
    </BrowserRouter>
    </ContactState>
  );
};

export default App;