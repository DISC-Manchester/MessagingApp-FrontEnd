import React from 'react';
import './App.css';
const API = "http://localhost:8080";

function App() {
	return (
		<div id="container">
			<h1>Content Example</h1>
			<Mailbox />
			<hr />
			<SendForm />
		</div>
	);
}

class Mailbox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {messages: []};
		this.convertTime = this.convertTime.bind(this);
	};
	convertTime(time = "") {
		let dateObj = new Date(time);

		let outstring = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}, ${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`
			
		return outstring;
	}
	
	componentDidMount() {
		fetch(API)
		.then((response) => response.json())
		.then((data) => this.setState({ messages: data}))
		.catch(function(err) {return <div>Failed to connect to API...</div>});
	}
	render() {
		const messages = this.state.messages.map((msg) => {
		return <div className="post" key={msg._id}><span className="author">{msg.author}</span><span className="time">{this.convertTime(msg.timestamp)}</span><hr/><div className="message-wrapper"><span className="message">{msg.message}</span></div></div>
		}); // I usually prefer inline functions prefered to arrow ones, but (this) was important to persist.
		return (
			<div id="postbox">
				{messages}
			</div>
		);
	};
}

class SendForm extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.state = {authorName: "", messageInput: ""};
		this.PushMessageToRemote = this.PushMessageToRemote.bind(this);
		this.handleMsgBoxChange = this.handleMsgBoxChange.bind(this);
		this.handleAuthorChange = this.handleAuthorChange.bind(this);
	};
	PushMessageToRemote(e) {
		const req = new XMLHttpRequest();
		req.open("POST", API);
		let messageJSON = JSON.stringify({"author": this.state.authorName, "message": this.state.messageInput})
		req.setRequestHeader('Content-type', 'application/json');
		req.send(messageJSON);
		req.addEventListener('load', () => {
			if (req.status === 201) {
				this.formRef.current.style.borderColor = "green";
			} else {
				this.formRef.current.style.borderColor = "red";
			}
			setTimeout(() => {
				this.formRef.current.style.borderColor = "black";
			}, 5000);
		});
		req.addEventListener('error', () => {
			this.formRef.current.style.borderColor = "red";
			setTimeout(() => {
				this.formRef.current.style.borderColor = "black";
			}, 5000);
		})
	}

	handleMsgBoxChange(e) {
		this.setState({
			messageInput: e.target.value
		});
	}

	handleAuthorChange(e) {
		this.setState({
			authorName: e.target.value
		});
	}

	render() {
		return (
			<div>
				<form action="http://localhost:8080/" method="post" className="send-message-form">
					<div id="sendmsg" ref={this.formRef}>
						<label htmlFor="name">Name: </label><input type="text" name="author" id="author" onChange={this.handleAuthorChange} value={this.state.authorName} required />
						<button onClick={this.PushMessageToRemote} type="button">Send</button>
						<br />
						<div className="msg-entry-wrapper">
							<label htmlFor="message">Write your message here:</label>
							<textarea id="message" name="message" onChange={this.handleMsgBoxChange} value={this.state.messageInput}></textarea>
						</div>
						<br />
					</div>
				</form>
			</div>
		)
	}
}

export default App;
