/** @jsx jsx */

import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { useHistory } from "react-router-dom"
import { Box, Flex, Text, jsx } from "theme-ui"
import { toast } from "react-hot-toast"
import { TbHelp, TbGitPullRequest } from "react-icons/tb"
import { BiSolidBarChartAlt2 } from "react-icons/bi"

import { formatTimeAgo } from "../../util/misc"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { RootState } from "../../store"
import api from "../../util/api"
import { User } from "../../util/types"
import { CreateConversationModal } from "../CreateConversationModal"
import { DashboardConversation } from "./conversation"
import { DashboardUserButton } from "./user_button"
import ConversationsList from "./conversations_list"

export const MIN_SEED_RESPONSES = 5

const ConversationsPreview = ({ conversations }) => {
  const hist = useHistory()

  return (
    <Box sx={{ pt: [3], ml: "26px" }}>
      {conversations.length === 0 && (
        <Box sx={{ fontWeight: 500, mt: [4], opacity: 0.5 }}>None found</Box>
      )}
      {conversations.map((c) => {
        const date = new Date(c.fip_created || +c.created)
        const timeAgo = formatTimeAgo(+date)

        console.log(c)
        return (
          <Flex
            sx={{
              bg: "bgWhite",
              border: "1px solid #e2ddd599",
              borderRadius: "8px",
              px: [3],
              py: "12px",
              mb: [2],
              lineHeight: 1.3,
              cursor: "pointer",
              "&:hover": {
                border: "1px solid #e2ddd5",
              },
            }}
            key={c.created}
            onClick={() => hist.push(`/dashboard/c/${c.conversation_id}`)}
          >
            <Box sx={{ pr: "13px", pt: "1px" }}>
              {c.github_pr_title ? (
                <TbGitPullRequest color="#3fba50" />
              ) : (
                <BiSolidBarChartAlt2 color="#0090ff" />
              )}
            </Box>
            <Box>
              <Box>
                {c.github_pr_title && <Text sx={{ fontWeight: 600 }}>FIP: </Text>}
                {c.fip_title || c.github_pr_title || c.topic}
              </Box>
              <Box sx={{ opacity: 0.6, fontSize: "0.94em", mt: "3px", fontWeight: 400 }}>
                Created {timeAgo}
              </Box>
            </Box>
          </Flex>
        )
      })}
    </Box>
  )
}

type DashboardProps = {
  user: User
  selectedConversationId: string | null
}

const Dashboard = ({ user, selectedConversationId }: DashboardProps) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { data } = useAppSelector((state: RootState) => state.conversations_summary)
  const conversations = data || []

  const [createConversationModalIsOpen, setCreateConversationModalIsOpen] = useState(false)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const syncPRs = () => {
    // github sync
    setSyncInProgress(true)
    toast.success("Getting updates from Github...")
    api
      .post("api/v3/github_sync", {})
      .then(({ existingFips, openPulls, fipsUpdated, fipsCreated }) => {
        toast.success(`Found ${existingFips} existing FIPs, ${openPulls} open FIP PRs`)
        setTimeout(() => {
          toast.success(`Updated ${fipsUpdated} FIPs, synced ${fipsCreated} new FIPs`)
          setTimeout(() => {
            location.reload()
          }, 2000)
        }, 2000)
      })
      .fail((error) => {
        toast.error("Sync error")
        console.error(error)
      })
      .always(() => {
        setSyncInProgress(false)
      })
  }

  return (
    <Box sx={{ height: "100vh" }}>
      <Flex sx={{ display: "flex", height: "100%" }}>
        <Box
          sx={{
            width: ["40%", null, "340px"],
            borderRight: "1px solid #e2ddd5",
            bg: "bgOffWhite",
            maxHeight: "100vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Flex
            sx={{
              width: "100%",
              borderBottom: "1px solid #e2ddd5",
              pt: "7px",
              pb: "14px",
              px: "18px",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <Box sx={{ flexGrow: "1" }}>
              <RouterLink to="/dashboard">
                <img
                  src="/filecoin.png"
                  width="25"
                  height="25"
                  sx={{
                    position: "relative",
                    top: "6px",
                    mr: [2],
                  }}
                />
                <Text
                  variant="links.text"
                  sx={{
                    color: "text",
                    "&:hover": { color: "text" },
                    fontWeight: 700,
                    display: "inline",
                  }}
                >
                  Metropolis
                </Text>
              </RouterLink>
            </Box>
          </Flex>
          <ConversationsList
            selectedConversationId={selectedConversationId}
            setCreateConversationModalIsOpen={setCreateConversationModalIsOpen}
            syncPRs={syncPRs}
            syncInProgress={syncInProgress}
            user={user}
          />
        </Box>
        <Box sx={{ overflowY: "scroll", flex: 1, position: "relative", bg: "bgDarkWhite" }}>
          <DashboardUserButton />
          {selectedConversationId ? (
            <DashboardConversation selectedConversationId={selectedConversationId} user={user} />
          ) : (
            <Box sx={{ maxWidth: "540px", px: [3], py: [3], pt: [8], margin: "0 auto" }}>
              <Box>
                Welcome to Metropolis, a nonbinding sentiment check tool for the Filecoin community.
                You can:
              </Box>
              {/* FIPs */}
              <Flex sx={{ pt: [3], mt: [3] }}>
                <Box sx={{ flex: "0 0 25px" }}>
                  <TbGitPullRequest color="#3fba50" style={{ marginRight: "6px" }} />
                </Box>
                <Box>
                  <Text sx={{ fontWeight: 700 }}>Signal your position</Text> on FIPs through
                  sentiment checks. <br />
                  The following FIPs are currently open for sentiment checks:
                </Box>
              </Flex>
              <ConversationsPreview
                conversations={conversations
                  .filter((c) => !c.is_archived && !c.is_hidden && c.github_pr_title)
                  .slice(0, 5)}
              />
              {/* discussions */}
              <Flex sx={{ pt: [3], mt: [3] }}>
                <Box sx={{ flex: "0 0 25px" }}>
                  <BiSolidBarChartAlt2 color="#0090ff" style={{ marginRight: "6px" }} />
                </Box>
                <Box>
                  <Text sx={{ fontWeight: 700 }}>
                    Initiate discussions, collect feedback, and respond to polls
                  </Text>{" "}
                  on open-ended thoughts or ideas.
                </Box>
              </Flex>
              <Box sx={{ pt: [2], pl: "25px" }}>
                The following discussion polls have been active recently:
              </Box>
              <ConversationsPreview
                conversations={conversations
                  .filter((c) => !c.is_archived && !c.is_hidden && !c.github_pr_title)
                  .slice(0, 5)}
              />
            </Box>
          )}
        </Box>
      </Flex>
      <CreateConversationModal
        isOpen={createConversationModalIsOpen}
        setIsOpen={setCreateConversationModalIsOpen}
      />
    </Box>
  )
}

export default Dashboard
