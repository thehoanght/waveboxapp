import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { guestStore } from 'stores/guest'
import shallowCompare from 'react-addons-shallow-compare'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)
    guestStore.listen(this.guestStoreChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)
    guestStore.unlisten(this.guestStoreChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  mailboxesChanged = (mailboxState) => {
    const activeMailbox = mailboxState.activeMailbox()
    this.setState({
      unreadCount: mailboxState.totalUnreadCountForAppBadge(),
      activeMailboxName: activeMailbox ? activeMailbox.displayName : undefined,
      activeGuestTitle: this._getGuestPageTitle(mailboxState, undefined)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      showTitlebarCount: settingsState.ui.showTitlebarCount,
      showTitlebarAccount: settingsState.ui.showTitlebarAccount
    })
  }

  guestStoreChanged = (guestState) => {
    this.setState({
      activeGuestTitle: this._getGuestPageTitle(undefined, guestState)
    })
  }

  /**
  * Gets the page title for the active mailbox/service
  * @param mailboxState=autoget: the current mailbox state
  * @param guestState=autoget: the current guest state
  * @return the page title or undefined
  */
  _getGuestPageTitle = (mailboxState = mailboxStore.getState(), guestState = guestStore.getState()) => {
    return guestState.getPageTitle([mailboxState.activeMailboxId(), mailboxState.activeMailboxService()])
  }

  state = (() => {
    const settingsState = settingsStore.getState()
    const mailboxState = mailboxStore.getState()
    const guestState = guestStore.getState()
    const activeMailbox = mailboxState.activeMailbox()

    return {
      showTitlebarCount: settingsState.ui.showTitlebarCount,
      showTitlebarAccount: settingsState.ui.showTitlebarAccount,
      unreadCount: mailboxState.totalUnreadCountForAppBadge(),
      activeGuestTitle: this._getGuestPageTitle(mailboxState, guestState),
      activeMailboxName: activeMailbox ? activeMailbox.displayName : undefined
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      showTitlebarCount,
      showTitlebarAccount,
      unreadCount,
      activeGuestTitle,
      activeMailboxName
    } = this.state

    const titleComponents = [
      'Wavebox',
      showTitlebarCount && unreadCount !== 0 ? `(${unreadCount})` : undefined,
      showTitlebarAccount && activeMailboxName ? `| ${activeMailboxName}` : undefined,
      showTitlebarAccount && activeGuestTitle ? `| ${activeGuestTitle}` : undefined
    ]

    const title = titleComponents.filter((c) => !!c).join(' ')
    if (title !== document.title) {
      document.title = title
    }

    return null
  }
}
