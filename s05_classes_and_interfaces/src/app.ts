class Department {
  name: string;
  private employees: string[] = [];

  constructor(n: string) {
    this.name = n;
  }

  describe(this: Department) {
    console.log('Departement: ' + this.name);
  }

  addEmployee(employee: string) {
    // + validation here (etc.)
    this.employees.push(employee);
  }

  printEmployeeInformation() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

const accounting = new Department('accounting');
accounting.addEmployee('Max');
accounting.addEmployee('Manu');
accounting.employees[2] = 'Anna'; // WE DON'T WANT THAT, because we want to use addEmployee (for the validation...)
accounting.describe();
accounting.printEmployeeInformation();