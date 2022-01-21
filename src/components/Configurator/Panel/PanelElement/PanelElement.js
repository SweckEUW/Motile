import './PanelElement.css';
import React, {useContext,useEffect,useState} from 'react';
import ServerRequest from '../../../../services/ServerRequest';
import ComponentSelector from '../ComponentSelector/ComponentSelector'
import Swiper from 'swiper';
import 'swiper/swiper.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import {Context} from '../../../../Store'

function PanelElement(props){
  const [state, setState] = useContext(Context);
  const [motileParts, setMotileParts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [currentColors, setCurrentColors] = useState(null);

  useEffect(() =>{ 
    getMotileParts();
    
    // Works only with Timeout?
    setTimeout(() => {
      let swiper = new Swiper('#'+props.side,{
        spaceBetween: 50,
        allowTouchMove: false,
        observer: true
      });
      
      swiper.on('slideChange', () => {
        setCurrentPage(swiper.activeIndex);
      });

      setSwiper(swiper);
    }, 0);

  }, []);

  function changeSwiperPage(index){
    if(index != motileParts.length){
      setCurrentPage(index);
      swiper.slideTo(index);
    }else{
      props.swiper.slideNext();
    }
  }

  async function getMotileParts(){
    let motilePartsResponse = await ServerRequest.getAllMotileParts();
    if(motilePartsResponse.data.success){
      let localMotileParts = motilePartsResponse.data.parts.filter(part => part.side === props.side);
      setMotileParts(localMotileParts);
      setupCurrentSettings(localMotileParts);
      setupCurrentColors(localMotileParts);
    }
  }

  function setupCurrentColors(localMotileParts){
    let newCurrentColors = [];
    localMotileParts.forEach(motilePart => {
      newCurrentColors.push(motilePart.metaData.colorways[0]);
    });
    setCurrentColors(newCurrentColors);
  }

  function setupCurrentSettings(localMotileParts){
    let newCurrentSettings = [];
    localMotileParts.forEach((motilePart,index) => {
      newCurrentSettings.push([]);
      motilePart.metaData.options.forEach(option => {
        if(option.type == "columns")
          option.selectedOptions = [option.selections[0]];
        if(option.type == "switch")
          option.selectedOptions = Array(option.selections.length);
        if(option.type == "rows")
          option.selectedOptions = [option.selections[0].additionalInfo];
        if(option.type == "addon")
          option.selectedOptions = [""];
        newCurrentSettings[index].push(option);
      });
    });
    setCurrentSettings(newCurrentSettings);
  }

  function updateCurrentSettings(index1, index2,index3,selectedOption){
    let newCurrentSettings = currentSettings;
    newCurrentSettings[index1][index2].selectedOptions[index3] = selectedOption;
    setCurrentSettings(newCurrentSettings);
  }

  function updateCurrentColors(index,color){
    let newCurrentColors = currentColors;
    newCurrentColors[index] = color;
    setCurrentColors(newCurrentColors);
    console.log(newCurrentColors)
  }

  function addComponent(motilePart,index){
    document.dispatchEvent(new CustomEvent("spawnComponent", {detail:{name: motilePart.name}}));
    let component = {component: motilePart, settings: currentSettings[index], color: "red"}
    let components = state.components;
    components.push(component);
    console.log(component)
    setState(prevState => ({...prevState,components: components}));
    
    changeSwiperPage(currentPage+1);
  }

  return (
    <div className="PanelElement">

      <p className="side">{props.side == "Back" ? "Rückseite" : "Vorderseite"}</p>

      {/* MotilePart Icons */}
      <div className="mp-icons">
        {motileParts.map((motilePart,index) =>{return(
          <span key={index} className="mp-icon material-icons" onClick={() =>{changeSwiperPage(index)}} style={{
            opacity: index === currentPage ? '1' : '0.3',
            fontSize: index === currentPage ? '48px' : '24px'
          }}>
            {motilePart.metaData.icon}
          </span>
        )})}
      </div>                
      
      <div id={props.side} className="swiper"> 
        <div className="swiper-wrapper">
          {motileParts.map((motilePart,index) =>{return(
            <div key={index} className='swiper-slide'>
              <div className="mp-settings">
                <div className="mp-info" style={{backgroundImage: "url("+motilePart.metaData.thumbnail+")"}}>
                  <h2 className="mp-name">{motilePart.name}</h2>
                  <p className="mp-price">{motilePart.metaData.price}</p>
                  <div className="mp-colors">
                    {motilePart.metaData.colorways.map((colorway,index2) =>{return(
                      <input type="radio" name={motilePart.name+"_Radio"} key={index2} className="mp-dot" defaultChecked={index2 == 0} style={{background: colorway}} onClick={() =>{updateCurrentColors(index,colorway)}}/>
                    )})}
                  </div>
                </div>
                <div className="mp-description">{motilePart.metaData.description}</div>
                <div className='mp-selectors'>
                  {motilePart.metaData.options.map((option, index2) => {
                    return <ComponentSelector key={index2} type={option.type} options={option.selections} heading={option.name} index1={index} index2={index2} updateCurrentSettings={updateCurrentSettings}/>
                  })}
                </div>
              </div>
              <div className="mp-button" onClick={() =>{addComponent(motilePart,index)}}>{props.side == "Back" && index == motileParts.length-1 ? "Weiter" : "Einbauen"}</div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}

export default PanelElement;