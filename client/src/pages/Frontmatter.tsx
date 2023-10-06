import React from "react"
import { Box } from "theme-ui"
import { Conversation } from "../util/types"

type FrontmatterProps = {conversation: Conversation}

export const Frontmatter: React.FC<FrontmatterProps> = ({conversation}) => {
  const fields = ["title", "author", "discussions-to", "status", "type", "category", "created"];
  const valueFieldNames = ["fip_title", "fip_author", "fip_discussions_to", "fip_status", "fip_type", "fip_category", "fip_created"];

  return  (
    <Box sx={{ overflowX: "scroll", px: [3], py: [3], border: "1px solid #ddd"}}>
      <table>
        <thead>
          <tr>
            {fields.map((field, i) => <th key={i}>{field}</th>)}
          </tr>
        </thead>
        <tbody className='border'>
          {valueFieldNames.map((valueFieldName, i) => (<td key={`${i}-value`} className='border'>{conversation[valueFieldName]}</td>))}
        </tbody>
      </table>
    </Box>
  )
}
