var React = require('react');
var _     = require('lodash').noConflict();

var InputTypes = require('./inputTypes');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Question extends React.Component {

  constructor(props) {
    super(props);
    var displayConfirmation = this.props.displayConfirmation;
    if(displayConfirmation.isNeed && (this.props.value !== undefined && this.props.value !== '') ){
      displayConfirmation.isNeed = false;
    }
    this.state = {
      displayConfirmation : displayConfirmation,
    };
  }  

  handleInputChange(questionId, value, progress) {
    this.props.onAnswerChange(
      questionId,
      value,
      this.props.validations,
      this.props.validateOn,
      progress
    );
  }

  handleInputBlur(questionId, value) {
    this.props.onQuestionBlur(
      questionId,
      value,
      this.props.validations,
      this.props.validateOn
    );
  }

  displayChange() {
    var display = this.state.displayConfirmation;
    display.isNeed = !display.isNeed;
    this.setState({displayConfirmation: display});
  }  

  render() {
    var Input = InputTypes[this.props.input.type];
    if (!Input) {
      throw new Error('Winterfell: Input Type "' + this.props.input.type +
                      '" not defined as Winterfell Input Type');
    }

    /*
     * Conditional Questions
     *
     * Go through the inputs options and filter them down
     * to options where the value matches the current questions
     * value. If we have conditional questions on a given option,
     * then render this component with the props for the conditional
     * question.
     */
    var conditionalItems = [];
    var conditionalAnswers = {};
    var mappingConditionalAnswers = {};
    if (typeof this.props.input.options !== 'undefined') {
      this.props.input.options
          .filter(option => {
            return this.props.value instanceof Array
                     ? this.props.value.indexOf(option.value) > -1
                     : this.props.value == option.value;
          })
          .filter(option => {
            return typeof option.conditionalQuestions !== 'undefined'
                     && option.conditionalQuestions.length > 0;
          })
          .forEach(option =>
            [].forEach.bind(option.conditionalQuestions, conditionalQuestion => {
              if (conditionalQuestion.questionSetId !== 'undefined') {
                var QuestionSet;
                if (this._reactInternalFiber._debugOwner !== undefined) {
                  QuestionSet = this._reactInternalFiber._debugOwner.elementType;
                } else {
                  // @Todo need to change as dynamic .return.return.return
                  QuestionSet = this._reactInternalFiber.return.return.return.elementType;
                }
                conditionalItems.push(
                  <QuestionSet key={conditionalQuestion.questionSetId}
                                id={conditionalQuestion.questionSetId}
                                name={conditionalQuestion.name}
                                questionSetHeader={conditionalQuestion.questionSetHeader}
                                questionSetText={conditionalQuestion.questionSetText}
                                questionSetHtml={conditionalQuestion.questionSetHtml}
                                questions={conditionalQuestion.questions}
                                questionSetClass={conditionalQuestion.questionSetClass}
                                classes={this.props.classes}
                                questionAnswers={this.props.questionAnswers}
                                renderError={this.props.renderError}
                                renderRequiredAsterisk={this.props.renderRequiredAsterisk}
                                validationErrors={this.props.validationErrors}
                                onAnswerChange={this.props.onAnswerChange}
                                onQuestionBlur={this.props.onQuestionBlur}
                                onKeyDown={this.props.onKeyDown} />
                );
              } else {
                conditionalItems.push(
                  <Question key={conditionalQuestion.questionId}
                            questionSetId={this.props.questionSetId}
                            questionContainerClass={conditionalQuestion.questionContainerClass}
                            questionId={conditionalQuestion.questionId}
                            question={conditionalQuestion.question}
                            text={conditionalQuestion.text}
                            postText={conditionalQuestion.postText}
                            validateOn={conditionalQuestion.validateOn}
                            validations={conditionalQuestion.validations}
                            value={this.props.questionAnswers[conditionalQuestion.questionId]}
                            input={conditionalQuestion.input}
                            displayConfirmation={conditionalQuestion.displayConfirmation}
                            classes={this.props.classes}
                            renderError={this.props.renderError}
                            questionAnswers={this.props.questionAnswers}
                            validationErrors={this.props.validationErrors}
                            onAnswerChange={this.props.onAnswerChange}
                            onQuestionBlur={this.props.onQuestionBlur}
                            onKeyDown={this.props.onKeyDown} />
                );
              }
            }
          )());
      this.props.input.options
          .filter(option => {
            return typeof option.conditions !== 'undefined'
                     && option.conditions.length > 0;
          })
          .forEach(option =>
            [].forEach.bind(option.conditions, condition => {
              conditionalAnswers[condition.questionId] = this.props.questionAnswers[condition.questionId];
            }
          )());
      this.props.input.options
          .filter(option => {
            return typeof option.mappingConditions !== 'undefined'
                     && option.mappingConditions.length > 0;
          })
          .forEach(option =>
            [].forEach.bind(option.mappingConditions, condition => {
              Object.keys(condition).forEach(questionId => {
                mappingConditionalAnswers[questionId] = this.props.questionAnswers[questionId];
              });
            }
          )());
    }

    // Get the current value. If none is set, then use
    // the default if given.
    var value = typeof this.props.value !== 'undefined'
                  ? this.props.value
                  : typeof this.props.input.default !== 'undefined'
                      ? this.props.input.default
                      : undefined;

    // Retrieve the validation errors for the
    // current question and map them in to
    // error-message blocks.
    var validationErrors = typeof this.props.validationErrors[this.props.questionId] !== 'undefined'
                             ? this.props.validationErrors[this.props.questionId]
                                   .map(error => {
                                     return typeof this.props.renderError === 'function'
                                              ? this.props.renderError(error, this.props.questionId)
                                              : (
                                                  <div key={this.props.questionId + 'Error' + error.type}
                                                       className={this.props.classes.errorMessage}>
                                                    {error.message}
                                                  </div>
                                                );
                                   })
                             : [];

    var validationInputErrors = typeof this.props.validationErrors[this.props.questionId] !== 'undefined'
    ? this.props.validationErrors[this.props.questionId]
          .map(error => {
            return typeof this.props.renderError === 'function'
                    ? this.props.renderError(error, this.props.questionId)
                    : ' error';
          })
    : '';                             

    let labelId = `${this.props.questionId}-label`;

	  var checked = (
      this.props.input.type === 'checkboxInput' &&
      typeof this.props.input.default !== 'undefined' &&
      this.props.input.default === this.props.value
    ) ? true : false;
    
    return (
      <div className={this.props.classes.question + this.props.questionContainerClass + validationInputErrors}>
        {this.state.displayConfirmation.isNeed && !this.state.displayConfirmation.icon && (
          <React.Fragment>
          <button onClick={this.displayChange.bind(this)}>{this.state.displayConfirmation.text}</button>
          </React.Fragment>
        )}
        {this.state.displayConfirmation.isNeed && this.state.displayConfirmation.icon && (
          <React.Fragment>
          <a onClick={this.displayChange.bind(this)}> <FontAwesomeIcon icon={this.state.displayConfirmation.icon} className="fa-fw text-24" /> </a>
          </React.Fragment>
        )}
        {!this.state.displayConfirmation.isNeed && (
          <React.Fragment>
        {!!this.props.question
          ? (
              <label className={this.props.classes.label}
                     id={labelId}
                     htmlFor={this.props.questionId}>
                {this.props.question}
                {typeof this.props.renderRequiredAsterisk !== 'undefined'
                   && this.props.input.required
                   ? this.props.renderRequiredAsterisk()
                   : undefined}
        {!!this.props.text
          ? (
              <small className={this.props.classes.questionText}>
                {this.props.text}
              </small>
            )
          : undefined}                   
              </label>
            )
          : undefined}

        <Input name={this.props.questionId}
               id={this.props.questionId}
               labelId={labelId}
               value={value}
               defaultChecked={checked}
               questionInputClass={this.props.input.questionInputClass}
               text={this.props.input.text}
               options={this.props.input.options}
               conditionalAnswers={conditionalAnswers}
               mappingConditionalAnswers={mappingConditionalAnswers}
               placeholder={this.props.input.placeholder}
               required={this.props.input.required}
               classes={this.props.classes}
               questionAnswers={this.props.questionAnswers}
               onChange={this.handleInputChange.bind(this, this.props.questionId)}
               onBlur={this.handleInputBlur.bind(this, this.props.questionId)}
               onKeyDown={this.props.onKeyDown}
               {...(typeof this.props.input.props === 'object'
                     ? this.props.input.props
                     : {})}
        />
        {validationErrors}
        {!!this.props.postText
          ? (
              <p className={this.props.classes.questionPostText}>
                {this.props.postText}
              </p>
            )
          : undefined}
        {conditionalItems}
        </React.Fragment>
        )}
      </div>
    );
  }

  componentDidMount() {
    if (typeof this.props.input.default === 'undefined'
          || (this.props.input.type === 'checkboxInput'
                && typeof this.props.questionAnswers[this.props.questionId] === 'undefined')) {
      return;
    }

    this.handleInputChange.call(
      this,
      this.props.questionId,
      this.props.input.default
    );
  }

};

Question.defaultProps = {
  questionSetId          : undefined,
  questionId             : undefined,
  questionContainerClass : '',  
  question               : '',
  validateOn             : 'blur',
  validations            : [],
  text                   : undefined,
  postText               : undefined,
  value                  : undefined,
  input                  : {
    default     : undefined,
    type        : 'textInput',
    limit       : undefined,
    placeholder : undefined,
    questionInputClass : '',
  },
  classes                : {},
  questionAnswers        : {},
  validationErrors       : {},
  onAnswerChange         : () => {},
  onQuestionBlur         : () => {},
  onKeyDown              : () => {},
  renderError            : undefined,
  renderRequiredAsterisk : undefined,
  displayConfirmation:{
    text: '',
    icon: false,
    isNeed: false
  }
};

module.exports = Question;
