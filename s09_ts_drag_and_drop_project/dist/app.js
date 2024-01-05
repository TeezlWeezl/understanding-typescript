"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["active"] = 0] = "active";
    ProjectStatus[ProjectStatus["finished"] = 1] = "finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, prjStatus) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.prjStatus = prjStatus;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(addListenerFn) {
        this.listeners.push(addListenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople, prjStatus) {
        const newProject = new Project(Math.random.toString(), title, description, numOfPeople, prjStatus);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            const projectsCopy = this.projects.slice();
            listenerFn(projectsCopy);
        }
    }
}
const prjState = ProjectState.getInstance();
const validate = (validatableInput) => {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid &&
                validatableInput.value.trim().length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid &&
                validatableInput.value.trim().length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null &&
        typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null &&
        typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
};
class BaseClass {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends BaseClass {
    get persons() {
        if (this.project.people === 1) {
            return '1 Person';
        }
        return `${this.project.people} persons`;
    }
    constructor(hostId, id, prj) {
        super('single-project', hostId, false, prj.id);
        this.listItem = document.createElement('li');
        this.project = prj;
        this.configure();
        this.renderContent();
    }
    configure() { }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = `${this.persons} assigned`;
        this.element.querySelector('p').textContent = this.project.description;
    }
}
class ProjectList extends BaseClass {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        prjState.addListener((prjList) => {
            const relevantPrjList = prjList.filter((prj) => {
                if (this.type === 'active') {
                    return prj.prjStatus === ProjectStatus.active;
                }
                else if (this.type === 'finished') {
                    return prj.prjStatus === ProjectStatus.finished;
                }
            });
            this.assignedProjects = relevantPrjList;
            this.renderContent();
        });
        this.configure();
    }
    renderContent() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        while (listEl.firstChild) {
            listEl.removeChild(listEl.firstChild);
        }
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, 'project-item', prjItem);
        }
    }
    configure() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }
}
class ProjectInput extends BaseClass {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement =
            this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.renderContent();
    }
    renderContent() {
        const submitHandler = (e) => {
            e.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, descrioption, people] = userInput;
                prjState.addProject(title, descrioption, people, ProjectStatus.active);
                this.clearUserInput();
            }
        };
        this.element.addEventListener('submit', submitHandler);
    }
    configure() { }
    clearUserInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true,
        };
        const descrioptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descrioptionValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid input, please try again...');
            return;
        }
        else {
            return [
                enteredTitle.trim(),
                enteredDescription.trim(),
                +enteredPeople.trim(),
            ];
        }
    }
}
const projectInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
//# sourceMappingURL=app.js.map