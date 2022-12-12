import React from 'react';
import './App.css';
const API = "http://localhost:8080";

class App extends React.Component {
	constructor() {
		super();
		this.state = {messages: []};
	}
	
	appendMessage = (input) => {
		let newMessage = {"timestamp": (new Date()).toJSON(), "author": input.authorName, "message": input.messageInput, "_id": Math.random().toString().substring(2)};
		this.setState({messages: [...this.state.messages, newMessage]});
	}

	componentDidMount() {
		fetch(API)
		.then((response) => response.json())
		.then((data) => this.setState({ messages: data}))
		.catch(function(err) {console.error("Failed to connect to API...")});
	}

	render() {
		return (
			<div id="container">
				<h1>Content Example</h1>
				<Mailbox messages={this.state.messages} />
				<hr />
				<SendForm appendMessage={this.appendMessage}/>
			</div>
		);
	}
}

class Mailbox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {messages: this.props.messages};
		this.convertTime = this.convertTime.bind(this);
	};
	convertTime(time = "") {
		let dateObj = new Date(time);

		let outstring = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}, ${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`
			
		return outstring;
	}

	componentDidUpdate(prevProps) {
		if(prevProps.messages.length !== this.props.messages.length) {
			this.setState({messages: this.props.messages});
		}
	}

	render() {
		const messages = this.state.messages.map((msg) => {
			return <div className="post" key={msg._id}><span className="author">{msg.author}</span><span className="time" title={msg.timestamp}>{this.convertTime(msg.timestamp)}</span><hr/><div className="message-wrapper"><span className="message">{msg.message}</span></div></div>
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
	
	appendMessage = () => {
		this.props.appendMessage(this.state)
	}
	
	PushMessageToRemote(e) {
		const req = new XMLHttpRequest();
		req.open("POST", API);
		let messageJSON = JSON.stringify({"author": this.state.authorName, "message": this.state.messageInput})
		req.setRequestHeader('Content-type', 'application/json');
		req.send(messageJSON);
		// Everything below this needs to be changed into something that shows bubble dialogs instead
		req.addEventListener('load', () => {
			if (req.status === 201) {
				this.formRef.current.style.background = "green";
				this.appendMessage();
			} else {
				this.formRef.current.style.background = "red";
			}
			setTimeout(() => {
				this.formRef.current.style.background = "transparent";
			}, 5000);
		});
		req.addEventListener('error', () => {
			this.formRef.current.style.background = "red";
			setTimeout(() => {
				this.formRef.current.style.background = "transparent";
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
				<form action={API} method="post" className="send-message-form">
					<div id="sendmsg" ref={this.formRef}>
						<div class="name-group">
							<label htmlFor="author" hidden>Name: </label><input type="text" name="author" id="author" placeholder="Name" onChange={this.handleAuthorChange} value={this.state.authorName} required />
							<div class="button-group">
								<button><LetterSVG/></button> {/*<!-- Very Bad Hack!!! Find real way to do this without redundant contents -->*/}
							</div>
						</div>
						<br />
						<div className="msg-entry-wrapper">
							<label htmlFor="message" hidden>Write your message here:</label>
							<textarea id="message" name="message" placeholder="message..." onChange={this.handleMsgBoxChange} value={this.state.messageInput}></textarea>
							<div class="button-group">
								<button onClick={this.PushMessageToRemote} type="button"><LetterSVG/></button>
							</div>
						</div>
						<br />
					</div>
				</form>
			</div>
		)
	}
}

const LetterSVG = (props) => (
  <svg
    width={25}
    height={25}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 25"
    {...props}
  >
    <path
      fill="none"
      stroke="#fff"
      d="m12.5 2.5-10 5V20h20V7.5Z"
      strokeWidth={1.25}
    />
    <path
      stroke="#fff"
      fill="none"
      d="m2.5 7.5 6.25 6.25L2.5 20l6.25-6.25h7.5L22.5 7.5l-6.25 6.25L22.5 20"
      strokeWidth={1}
    />
  </svg>
);

export default App;
