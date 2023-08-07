import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormControl} from "@angular/forms";
import {TableDataService} from "../../services/table-data.service";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  encapsulation: ViewEncapsulation.None,

})
export class TableComponent implements OnInit {
  public pageSize: number = 50;
  public totalSearchResults: number;
  public filterTypes: any[];

  public tableDataMaster: any = {
    header: [],
    data: []
  }

  public tableDataCurr: any = {
    ...this.tableDataMaster
  }

  public form;
  private currPage: number = 1;

  constructor(private formBuilder: FormBuilder, private tableDataService: TableDataService) {
    this.form = this.formBuilder.group({
      search: [''],
      filterType: this.formBuilder.array([])
    })
  }

  ngOnInit(): void {

    const tableDataFromService = this.tableDataService.getTableData();

    this.tableDataMaster = tableDataFromService;
    this.tableDataCurr.data = tableDataFromService.data.slice(0, this.pageSize);
    this.tableDataCurr.header = tableDataFromService.header;
    this.totalSearchResults = this.tableDataMaster.data.length;
    this.filterTypes = this.getFilteredTypes().map((e, i) =>{
      return {id: i+1 + '', value: e}
    })

  }
  private getFilteredTypes() {
    const arrOfTypes = this.tableDataMaster.data.map((row:any) =>{
      return row[3];
    });
    const set = new Set(arrOfTypes);
    return Array.from(set).sort();
  }

  public onCheckboxChange(event: any){
    const filterChoices: FormArray = this.form.get('filterType') as FormArray;

    if(event.target.checked){
      filterChoices.push(new FormControl(event.target.value))
    } else {
      const index = filterChoices.controls.findIndex(x => x.value === event.target.value);
      filterChoices.removeAt(index);
    }

    this.searchAndFilter();

  }
  public getSearchValue(){
    return this.form.controls['search']?.value;
  }

  searchIt(){
    this.searchAndFilter();
  }

  trackByIndex = (index: number): number => {
    return index;
  };

  public onPageChange(event: number){
    const newPage = event;
    this.currPage = newPage;
    this.searchAndFilter();

  }

  public getFilteredIds(){
    const filterChoices: FormArray = this.form.get('filterType') as FormArray;
    return filterChoices.controls.map((r:any) => r.value);
  }

  private searchAndFilter(){
    const searchValue = this.getSearchValue();
    const currPage = this.currPage;
    const start = this.pageSize * currPage - this.pageSize;
    const end = start + this.pageSize;
    const filterIds = this.getFilteredIds();
    const filterTypes = this.filterTypes.filter(e => filterIds.includes(e.id)).map(e => e.value)

    const filteredResults = this.tableDataMaster.data.filter((e: any) =>{
      const searchResults = e.some((r: any) =>{
        const searchResultsInner =  searchValue.length ?  r.includes(searchValue) : true;
        return searchResultsInner;
      });
      const filterResults = filterTypes.length?  filterTypes.includes(e[3]): true;
      return searchResults && filterResults;
    });
    this.totalSearchResults = filteredResults.length;
    this.tableDataCurr.data = filteredResults.slice(start, end);

  }



}
