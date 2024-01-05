enum ProjectStatus {
  active,
  finished,
}

// Drag & Drop Interface
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

interface Listener<T> {
  (items: Array<T>): void;
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public prjStatus: ProjectStatus,
  ) {}
}

// State class
abstract class State<T> {
  protected listeners: Array<Listener<T>> = [];

  constructor() {}

  addListener(addListenerFn: Listener<T>) {
    this.listeners.push(addListenerFn);
  }
}

// Project State Management - SINGLETON PATTERN
class ProjectState extends State<Project> {
  private projects: Array<Project> = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  } // with a private constructor you can't call new to instantiate a new instance of Project State

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(
    title: string,
    description: string,
    numOfPeople: number,
    prjStatus: ProjectStatus.active,
  ) {
    const newProject = new Project(
      Math.random.toString(),
      title,
      description,
      numOfPeople,
      prjStatus,
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      const projectsCopy = this.projects.slice(); // slice to add only a copy of the projects array
      listenerFn(projectsCopy);
    }
  }
}

const prjState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable) => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
};

abstract class BaseClass<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(
      templateId,
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );
    this.element = importedNode.firstElementChild! as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend',
      this.element,
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends BaseClass<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  listItem: HTMLLIElement = document.createElement('li');

  get persons() {
    if (this.project.people === 1) {
      return '1 Person';
    }
    return `${this.project.people} persons`;
  }

  constructor(hostId: string, id: string, prj: Project) {
    super('single-project', hostId, false, prj.id);
    this.project = prj;
    // this.listItem.textContent = prjItem.title;
    // listEl.appendChild(this.listItem);

    this.configure();
    this.renderContent();
  }

  dragStartHandler(event: DragEvent): void {
    console.log(event);
  }
  dragEndHandler(_: DragEvent): void {
    console.log('DragEnd detected...');
  }

  configure(): void {
    this.element.addEventListener(
      'dragstart',
      this.dragStartHandler.bind(this),
    );
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList
  extends BaseClass<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
  }

  dragOverHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.add('droppable');
  }
  dropHandler(event: DragEvent): void {
    console.log('Element dropped...');
  }
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  renderContent() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`,
    )! as HTMLUListElement;
    // Remove all childs before appending new projects list items
    while (listEl.firstChild) {
      listEl.removeChild(listEl.firstChild);
    }
    // appending all projects list items
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(
        this.element.querySelector('ul')!.id,
        'project-item',
        prjItem,
      );
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler.bind(this))
    this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this))
    this.element.addEventListener('drop', this.dragLeaveHandler.bind(this))

    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';

    prjState.addListener((prjList: Array<Project>): void => {
      const relevantPrjList = prjList.filter((prj) => {
        if (this.type === 'active') {
          return prj.prjStatus === ProjectStatus.active;
        } else if (this.type === 'finished') {
          return prj.prjStatus === ProjectStatus.finished;
        }
      });
      this.assignedProjects = relevantPrjList;
      this.renderContent();
    });
  }
}

// ProjectInput Class
class ProjectInput extends BaseClass<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.templateElement = document.getElementById(
      'project-input',
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    this.titleInputElement = this.element.querySelector('#title')!;
    this.descriptionInputElement = this.element.querySelector('#description')!;
    this.peopleInputElement = this.element.querySelector('#people')!;

    this.renderContent();
  }

  renderContent() {
    const submitHandler = (e: Event) => {
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

  configure() {}

  private clearUserInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private gatherUserInput():
    | [title: string, descrioption: string, people: number]
    | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descrioptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descrioptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again...');
      return;
    } else {
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
