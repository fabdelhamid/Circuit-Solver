#include "../../NodeAnalyzer.h"

/*
  Voltage to current source conversion
   Condition for conversion:
   Voltage source connected to to R or Z in series. Either top genode or bottom node.
   
   current properties of combined branch should not change,
   but obviously does not apply to the new shunt branches.
 
   //Series addition should be added first!
    
*/

coupled_item_list_t circuit_t::GetVRCouples ()
{
   coupled_item_list_t result;
   item_list_t current_list;
   
   //Convert RZ-VSRC to VSRC-RZ
   for (list<element_t*>::iterator p = elements.begin(); p != elements.end(); p++)
   {
       if  ((*p)->type == E_VSRC 
              && ((*p)->BottomNode()->elements.size()  == 2)
              && ((*p)->BottomNode()->OtherElementIsRZ(*p)))
              {                  
                  ExchangeElements (*p,(*p)->BottomOtherElement());
                  SeriesParallelReduction();                                          
                  p = elements.begin();
                                                      
              } /* if */       
   } /* for */

   // main loop
   for (list<element_t*>::iterator p = elements.begin(); p != elements.end(); p++)
   {
      current_list.clear();

       if  ((*p)->type == E_VSRC 
              && ((*p)->TopNode()->elements.size() == 2)
              && ((*p)->TopNode()->OtherElementIsRZ(*p)))
              {
                  element_t* vsource = *p;
                  element_t* series_load = (*p)->TopOtherElement();
               
               
               	  item_t t_item(vsource, false);
                  current_list.push_back (t_item);       

               	  item_t t_item2 (series_load, false);				    
                  current_list.push_back (t_item2);   
                                                                  
              } /* if */
        
        AddCouple (current_list, result);		
                          
    } /* for */
    
    return result;
} /* circuit_t::get_VR_couples */

unsigned int circuit_t::ConvertVSourcesToCSources ()
{
   unsigned int result = 0;
   
   coupled_item_list_t source_list = GetVRCouples();
   while (source_list.size() > 0)
   {         
       ConvertVRCouple(source_list.front());       
       
       
       result++;
       
       source_list = GetVRCouples();
   } /* while */               
  
   return result;
  
} /* circuit_t::convert_vsources_to_csources */

// Convert voltage to current source
void circuit_t::ConvertVRCouple (const item_list_t &couple)
  {
       element_t* vsource     = couple.front().e;
       element_t* series_load = couple.back().e;

       series_load->SetBottomNode(vsource->BottomNode());
       element_t* new_csource = AddElement(NONE, E_CSRC, 0, ITEM_DIRECTION_FWD,  series_load->TopNode(), series_load->BottomNode());

       
       new_csource->SetValueFromString (vsource->GetValueAsString() + " / " + series_load->GetValueAsString());

       UnifyNodes (vsource->TopNode(), vsource->BottomNode()); // Short crcuit the vsource                      
       DisconnectElement(vsource);   

       Reconstruct();
       //solution->add_step (STEP_CONVERT_VSOURCE_TO_CSOURCE);

  } /* circuit_t::convert_VR_couple */

