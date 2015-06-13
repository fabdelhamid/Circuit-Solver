#include "../../NodeAnalyzer.h"
// Series elements reduction
// condition: same type and same current

coupled_item_list_t circuit_t::GetSeriesLists ()
{
   coupled_item_list_t result;
   item_list_t current_list;

   for (list<element_t*>::iterator p = elements.begin(); p != elements.end(); p++)
   {
   	   current_list.clear();
       if ((*p)->type == E_RESISTOR || (*p)->type == E_INDUCTOR || (*p)->type == E_CAPACITOR || (*p)->type == E_IMPEDANCE 
           || (*p)->type == E_VSRC /* || elm[(*p)->type] == "CSRC" */)
	    {
            item_t t_item (*p,false);	    	
            current_list.push_back (t_item);
            
            for (list<element_t*>::iterator z = elements.begin(); z != elements.end(); z++)
                {
                   if (*z != *p && (*z)->type == (*p)->type && (*z)->Current() == (*p)->Current()) //TODO: ENABLE GHOSTING
                     {
                     	 item_t t_item (*z,false);
                         current_list.push_back (t_item);
						          
                     } /* if */
                } /* for */ 
        } /* if */
   } /* for */

   // add all couples to main list, callee takes care of duplicates
   AddList (current_list, result);	

} /* circuit_t::get_series_lists */

unsigned int circuit_t::ReduceSeriesElements ()
{
   unsigned int result = 0;
   
   coupled_item_list_t series_lists = GetSeriesLists ();
   while (series_lists.size() > 0)
   {         
       ReduceSeriesList (series_lists.front());      
       
       result++;
       
       series_lists = GetSeriesLists();
   } /* while */               
  
   return result;
    
} /* circuit_t::convert_series_elements  */

void circuit_t::ReduceSeriesList (const item_list_t &series_list)
{
     
     item_t first_item        = series_list.front();
     node_t* new_top_node     = first_item.e->TopNode();
     node_t* new_bottom_node  = first_item.e->BottomNode();
     
     string new_value = "";
     
     
     
    if ( first_item.e->type == E_CAPACITOR)
     {
             new_value = "(";
             for (item_list_t::const_iterator i = series_list.begin(); i != series_list.end(); i++)
              {
                     new_value +=  i->e->GetValueAsString(i->direction) +  "^(-1)";
                     if (next(i) != series_list.end()) new_value += " + ";                       
                     
                     DisconnectElement (i->e);

                     
                     
              } /* for */
             new_value += ")^(-1)";

                           
     } /* if */
     
     // all elements
     else
      {
         for (item_list_t::const_iterator i = series_list.begin(); i != series_list.end(); i++)
             {
                if (i->e->type == E_VSRC)
                  {
                     new_value +=  i->e->GetValueAsString(i->direction);
                     if (next(i) != series_list.end()) new_value += " + ";
                     
                  } /* if */
                else
                   {
                      new_value +=  i->e->GetValueAsString();
                      if (next(i) != series_list.end()) new_value += " + "; 
                   } /* else */ 
                   
                   
                   DisconnectElement (i->e);
             } /* for */
      } /* else */
       
       
      // Add new element
      element_t* new_element = AddElement (first_item.e->ParentBranch(), first_item.e->type, 0, ITEM_DIRECTION_FWD, new_top_node, new_bottom_node);
      
      
      new_element->SetValueFromString (new_value);
      
      Reconstruct();
      
      //solution->add_step (STEP_SERIES_REDUCTION, series_list);      
} /* circuit_t::convert_VR_couple  */


