/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import type { User } from '../../../types/User'
import type { Project } from '../../../types/Project'
import type { Field as FieldType } from '../../../types/Field'
import Button from '../../atoms/Button'
import Modal from '../../molecules/Modal'
import Field from '../../molecules/EndpointField'

import userImage from './images/user.svg'
import KeyboardManager from '../../../utils/KeyboardManager'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const Image = styled.div`
  width: 96px;
  height: 96px;
  background: url('${userImage}') center no-repeat;
  margin: 0 auto;
`
const Form = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 64px;
  overflow: auto;

  > div {
    margin-top: 16px;
  }
`
const Buttons = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
`

type Props = {
  user?: User,
  isLoggedUser?: boolean,
  loading: boolean,
  isNewUser?: boolean,
  projects: Project[],
  editPassword?: boolean,
  onRequestClose: () => void,
  onUpdateClick: (user: User) => void,
}

type State = {
  name: string,
  email: string,
  enabled: boolean,
  projectId: string,
  highlightFieldNames: string[],
  password: string,
  confirmPassword: string,
  description: string,
}

@observer
class UserModal extends React.Component<Props, State> {
  componentWillMount() {
    this.setState({
      name: this.props.user ? this.props.user.name : '',
      email: this.props.user ? this.props.user.email : '',
      description: this.props.user ? this.props.user.description : '',
      projectId: this.props.user ? this.props.user.project_id : '',
      enabled: this.props.user ? this.props.user.enabled : true,
      highlightFieldNames: [],
      password: '',
      confirmPassword: '',
    })
  }

  componentDidMount() {
    KeyboardManager.onEnter('editUserModal', () => {
      this.handleUpdateClick()
    }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('editUserModal')
  }

  handleUpdateClick() {
    if (
      (this.props.isNewUser && this.highlightAllFields()) ||
      (!this.props.isNewUser && !this.props.editPassword && this.highlightDetailsFields()) ||
      (!this.props.isNewUser && this.props.editPassword && this.highlightPasswordFields())
    ) {
      return
    }

    this.props.onUpdateClick({
      id: '',
      project: { id: '', name: '' },
      project_id: this.state.projectId,
      name: this.state.name,
      email: this.state.email,
      description: this.state.description,
      password: this.state.password,
      enabled: this.state.enabled,
    })
  }

  highlightAllFields() {
    const highlightFieldNames = []
    if (!this.state.name) {
      highlightFieldNames.push('username')
    }
    if (!this.state.password) {
      highlightFieldNames.push('new_password')
    }
    if (this.state.password && this.state.password !== this.state.confirmPassword) {
      highlightFieldNames.push('confirm_password')
    }
    if (highlightFieldNames.length > 0) {
      this.setState({ highlightFieldNames })
      return true
    }
    this.setState({ highlightFieldNames: [] })
    return false
  }

  highlightDetailsFields(): boolean {
    if (!this.state.name) {
      this.setState({ highlightFieldNames: ['username'] })
      return true
    }

    this.setState({ highlightFieldNames: [] })
    return false
  }

  highlightPasswordFields(): boolean {
    if (!this.state.password) {
      this.setState({ highlightFieldNames: ['new_password'] })
      return true
    }
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ highlightFieldNames: ['confirm_password'] })
      return true
    }
    this.setState({ highlightFieldNames: [] })
    return false
  }

  renderField(field: FieldType, value: any, onChange: (value: any) => void) {
    let disabled = this.props.loading || (this.props.isLoggedUser && field.name === 'enabled')

    return (
      <Field
        key={field.name}
        name={field.name}
        type={field.type || 'string'}
        value={value}
        onChange={onChange}
        large
        disabled={disabled}
        enum={field.enum}
        password={field.name === 'new_password' || field.name === 'confirm_password'}
        // $FlowIssue
        required={field.required}
        highlight={Boolean(this.state.highlightFieldNames.find(n => n === field.name))}
        noSelectionMessage="Choose a project"
      />
    )
  }

  renderForm() {
    let fields
    const userProjects = this.props.projects.map(p => { return { label: p.name, value: p.id } })

    const passwordFields = [
      this.renderField(
        { name: 'new_password', required: true },
        this.state.password,
        password => { this.setState({ password }) }
      ),
      this.renderField(
        { name: 'confirm_password', required: true },
        this.state.confirmPassword,
        confirmPassword => { this.setState({ confirmPassword }) }
      ),
    ]
    const detailsFields = [
      this.renderField(
        { name: 'username', required: true },
        this.state.name,
        name => { this.setState({ name }) }
      ),
      this.renderField(
        { name: 'description' },
        this.state.description,
        description => { this.setState({ description }) }
      ),
      this.renderField(
        { name: 'Email' },
        this.state.email,
        email => { this.setState({ email }) }
      ),
      this.renderField(
        {
          name: 'Primary Project',
          // $FlowIssue
          enum: [{ label: 'Choose a project', value: null }].concat(userProjects),
        },
        this.state.projectId,
        projectId => { this.setState({ projectId }) },
      ),
    ]
    const enabledField = this.renderField(
      { name: 'enabled', type: 'boolean' },
      this.state.enabled,
      enabled => { this.setState({ enabled }) }
    )

    if (this.props.isNewUser) {
      fields = detailsFields.concat(passwordFields).concat(enabledField)
    } else if (this.props.editPassword) {
      fields = passwordFields
    } else {
      fields = detailsFields.concat(enabledField)
    }

    return (
      <Form>
        {fields}
      </Form>
    )
  }

  render() {
    const label = this.props.isNewUser ? 'New User' : this.props.editPassword ? 'Change Password' : 'Update User'

    return (
      <Modal
        isOpen
        title={label}
        onRequestClose={this.props.onRequestClose}
      >
        <Wrapper>
          <Image />
          {this.renderForm()}
          <Buttons>
            <Button
              secondary
              large
              onClick={this.props.onRequestClose}
            >Cancel</Button>
            <Button
              large
              disabled={this.props.loading}
              onClick={() => { this.handleUpdateClick() }}
            >{label}</Button>
          </Buttons>
        </Wrapper>
      </Modal>
    )
  }
}

export default UserModal
