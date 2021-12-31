import React, { Component } from 'react'

class TodoList extends Component {

  render() {
    return (
      <div id="content">
        <form onSubmit={(event) => {
          event.preventDefault()
          this.props.createTask(this.task.value)
        }}>
          <input id="newTask" ref={(input) => this.task = input} type="text" className="form-control" placeholder="Add task..." required />
          <input type="submit" hidden="" />
        </form>
        <ul id="taskList" className="list-unstyled">
          { this.props.tasks.map((task, k) => {
            return(
              <div className="taskTemplate checkbox" key={k}>
                <label>
                  <input type="checkbox" />
                  <span className="content">{task.content}</span>
                </label>
              </div>
            )
          })}
        </ul>
        <ul id="completedTaskList" className="list-unstyled">
        </ul>
      </div>
    );
  }
}

export default TodoList;