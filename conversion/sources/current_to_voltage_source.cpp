#include "../../NodeAnalyzer.h"

/*
  current to voltage source conversion
   Condition for conversion:

   current source in parallel w/ RZ element
   */     
   
   
coupled_item_list_t circuit_t::GetCRCouples ()
{
   coupled_item_list_t result;
   item_list_t current_list;
 
   // main loop
   for (list<element_t*>::iterator p = elements.begin(); p!=elements.end(); p++)
   {
      current_list.clear();

       if  ((*p)->type == E_CSRC)
         {
            element_t* csource = *p;           
            current_list.push_back(*new item_t (csource, false));
            
            for (list<element_t*>::iterator z = elements.begin(); z != elements.end(); z++)
                if (SharedNodes (csource, *z) == 2)
                    current_list.push_back(*new item_t (*z, false));           
             
             
         } /* if */
         
         AddCouple (current_list, result);	
     } /* for */
    return result;
    
} /* circuit_t::get_CR_couples */

unsigned int circuit_t::ConvertCSourcesToVSources ()
{
   unsigned int result = 0;
   
   coupled_item_list_t source_list = GetCRCouples();

   while (source_list.size() > 0)
   {

       
       ConvertCRCouple (*source_list.begin());
       
       
       result++;
       
       source_list = GetCRCouples();
         
   } /* while */

   return result;
}  /* circuit_t::convert_csources_to_vsources */


//convert current to voltage source
void circuit_t::ConvertCRCouple (const item_list_t &couple)
  {
       element_t* csource       = couple.front().e;
       element_t* parallel_load = couple.back().e;
       
       node_t* new_common_node = CreateNode ();

       parallel_load->SetBottomNode (new_common_node);  //now is series     
       
       element_t* new_vsource = AddElement (parallel_load->ParentBranch(),  E_VSRC, 0, ITEM_DIRECTION_FWD, new_common_node, csource->BottomNode());
       
       new_vsource->SetValueFromString (csource->GetValueAsString() + "*" + parallel_load->GetValueAsString());

       DisconnectElement(csource);   

       Reconstruct();
       //solution->add_step (STEP_CONVERT_CSOURCE_TO_VSOURCE);
  } /* circuit_t::convert_CR_couple */
  
