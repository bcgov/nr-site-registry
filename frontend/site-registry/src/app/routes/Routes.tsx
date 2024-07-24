import React from 'react';
// import Landing from "../features/landing/Landing"
import { Routes, Route } from "react-router-dom";
import Search from "../features/site/Search";
import MapSearch from "../features/map/MapSearch";
import SiteDetails from "../features/details/SiteDetails";
import Dashboard from "../features/dashboard/Dashboard";
import Cart from "../features/cart/Cart";
import Folios from "../features/folios/Folios";
import FolioContents from "../features/folios/FolioContent";

const AppRoutes = () => {
  return (
    <Routes> 
      <Route path="/" element={<Dashboard />}></Route>      
      <Route path="/search" element={<Search />}></Route>  
      <Route path="/folios" element={<Folios/>}></Route>
      <Route path="/folios/:id" element={<FolioContents/>}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>  
      <Route path="/dashboard/site/details/:id" element={<SiteDetails/>}></Route>
      <Route path="/search/site/details/:id" element={<SiteDetails/>}></Route>
      <Route path="/site/map/:id" element={<MapSearch/>}></Route>  
      <Route path="/site/cart" element={<Cart/>}></Route>  
      <Route path="*" element={<h1>Page not found</h1>}></Route>
    </Routes>
  );
};

export default AppRoutes;
