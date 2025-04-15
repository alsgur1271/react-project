import React, { useState } from 'react';
import './App.css'


function App() {

  let post = '집 가고 싶다';
  let [슬퍼, b] = useState('ㅠㅠ');
  let [집, 가고] = useState("집보내줘시발발")
  let [글1, 글글] = useState("샘플플")
  let [슬퍼용, sadp]= useState(0);

  let num = [1, 2];
  let [a, c] = [1, 2];


  return (
  <div className="App">
    <div className= "black-nav">
      <h4 style={ {color: 'red', fontsize : '16px'} }
      >  hi</h4>
    </div>
    <div className = "list">
      <h4>{글1} <span onClick={()=>{sadp(슬퍼용+1) } }>😂</span> {슬퍼용} </h4>
      <p>슬프다</p>
    </div>

    <div className = "list">
      <h4>{슬퍼}</h4>
      <p>슬프다</p>
    </div>
    <div className = "list">
      <h4>{집}</h4>
      <p>보내줭줭</p>
    </div>
    <h4>{ post }</h4> 
    </div>
  )
}

export default App
