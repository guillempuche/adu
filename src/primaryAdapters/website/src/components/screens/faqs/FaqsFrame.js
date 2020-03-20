import React, { useEffect, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useQuery } from 'react-apollo-hooks';
import { withStyles } from '@material-ui/core/styles';
import { withRouter, Switch, Redirect, Route } from 'react-router-dom';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import { QUESTIONS_QUERY } from '../../../graphql/fetch/faqs';
import ROUTES from '../../../utils/routes';
import * as actions from '../../../actions';
import QuestionsFrame from './questions/QuestionsFrame';
import AnswersFrame from './answers/AnswersFrame';

const styles = theme => ({
	buttonGroup: {
		marginLeft: 10,
		marginTop: 10,
		marginBottom: 10
	}
});

/**
 * @function FaqsFrame It renders the frame for:
 * 1. all the answers of faculty's FAQs + editor of messages for each answer. Available
 * for all type of users.
 * 2. all questions that all faculties uses for their FAQs. Only available for the superusers.
 */
function FaqsFrame({ superuser, location, history, classes }) {
	// useEffect(() => {
	//     fetchAllQuestions();
	// }, [fetchAllQuestions]);
	// const { data, error, loading } = useQuery(QUESTIONS_QUERY);

	// console.log('Data', data);
	// console.log('Error', error);
	// console.log('Loading', loading);

	// useEffect(() => {
	//     if (error)
	//         setError('Problem getting the list of all questions of FAQs');
	// }, [error, setError]);

	// By default the superuser is redirected to questions.
	if (superuser)
		return (
			<div>
				<Route exact path={ROUTES.faqs.path}>
					<Redirect to={ROUTES.faqs.routes.questions.path} />
				</Route>
				<div className={classes.buttonGroup}>
					<ButtonGroup color="secondary">
						<Button
							disabled={
								location.pathname ===
								ROUTES.faqs.routes.questions.path
							}
							onClick={() => {
								history.push(ROUTES.faqs.routes.questions.path);
							}}
						>
							{ROUTES.faqs.routes.questions.title}
						</Button>
						<Button
							disabled={
								location.pathname ===
								ROUTES.faqs.routes.answers.path
							}
							onClick={() => {
								history.push(ROUTES.faqs.routes.answers.path);
							}}
						>
							{ROUTES.faqs.routes.answers.title}
						</Button>
					</ButtonGroup>
				</div>
				<Switch>
					<Route
						path={ROUTES.faqs.routes.questions.path}
						component={QuestionsFrame}
					/>
					<Route
						path={ROUTES.faqs.routes.answers.path}
						component={AnswersFrame}
					/>
				</Switch>
			</div>
		);
	// Redirect to answers if user isn't a superuser === they can't see questions.
	return (
		<Fragment>
			<Route exact path={ROUTES.faqs.path}>
				<Redirect to={ROUTES.faqs.routes.answers.path} />
			</Route>
			<Route
				path={ROUTES.faqs.routes.answers.path}
				component={AnswersFrame}
			/>
		</Fragment>
	);
}

function mapStateToProps({ auth }) {
	// TIP: 'superuser' variable only exists for superusers.
	const { superuser } = auth.userType;

	return { superuser };
}

const enhancer = compose(
	connect(mapStateToProps, actions),
	withRouter,
	withStyles(styles)
);

export default enhancer(FaqsFrame);
