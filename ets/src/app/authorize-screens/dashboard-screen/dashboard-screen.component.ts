import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

interface StatCard {
  label: string;
  count: number;
  bg?: string;
  color?: string;
  description: string;
  icon?: string;
}

@Component({
  selector: 'app-dashboard-screen',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard-screen.component.html',
  styleUrl: './dashboard-screen.component.css'
})
export class DashboardScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  stats: StatCard[] = [];
  isLoading: boolean = true;
  monthlyLabels: string[] = [];
  monthlyData: number[] = [];
  isMonthlyChartReady = false;
  monthlyChartInstance: Chart | null = null;
  doughnutChartInstance: Chart | null = null;

  doughnutLabels: string[] = [];
  doughnutData: number[] = [];

  selectedFilter: 'all' | 'self' = 'self';  
  showData: boolean = false;
  showAllData: boolean = false;
  
  private resizeObserver?: ResizeObserver;
  
  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true; 
    this.fetchApprovalStats();
    this.loadMonthlyChart();
    this.loadServiceChart();
    
    this.showData = this.authService.hasPermission('5.4');
    this.showAllData = this.authService.hasPermission('5.5');

    this.setupResizeObserver();
  }

  ngAfterViewInit(): void {
    this.isLoading = false;
    
    this.addStaggerAnimation();
  }

  ngOnDestroy(): void {
    if (this.monthlyChartInstance) {
      this.monthlyChartInstance.destroy();
    }
    if (this.doughnutChartInstance) {
      this.doughnutChartInstance.destroy();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  onFilterChange(filter: 'all' | 'self'): void {
    this.selectedFilter = filter;
    this.isLoading = true;
    
    setTimeout(() => {
      this.fetchApprovalStats();
      this.loadMonthlyChart();
      this.loadServiceChart();
        this.isLoading = false; 

    }, 500);
  }

  fetchApprovalStats(): void {
    this.dashboardService.getApprovalStats(this.selectedFilter).subscribe((res) => {
      const { unapproved, unassigned, in_process, for_release } = res;
      this.stats = [
        {
          label: 'For Approval',
          count: unapproved,
          bg: 'bg-warning',
          description: 'Awaiting approval of offices',
          icon: 'fa-clock'
        },
        {
          label: 'In Process',
          count: in_process,
          color: '#ed7d31',
          description: 'Resolving tickets in-progress',
          icon: 'fa-cogs'
        },
        {
          label: 'For Release',
          count: for_release,
          bg: 'bg-success',
          description: 'Awaiting for signature',
          icon: 'fa-check-circle'
        }
      ];
      
      this.addStaggerAnimation();
    });
  }

  loadMonthlyChart(): void {
    this.dashboardService.getMonthlyRequests(this.selectedFilter).subscribe(res => {
      if (res.status === 'success') {
        this.monthlyLabels = Object.keys(res.data);
        this.monthlyData = Object.values(res.data);
        this.isMonthlyChartReady = true;
        setTimeout(() => this.drawMonthlyChart(), 200);
      }
    });
  }

  loadServiceChart(): void {
    this.dashboardService.getRequestsByType(this.selectedFilter).subscribe(res => {
      if (res.status === 'success') {
        this.doughnutLabels = Object.keys(res.data);
        this.doughnutData = Object.values(res.data);
        setTimeout(() => this.drawDoughnutChart(), 200);
      }
    });
  }

  drawMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.monthlyChartInstance) {
      this.monthlyChartInstance.destroy();
    }

    this.monthlyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyLabels,
        datasets: [{
          label: 'Requests',
          data: this.monthlyData,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#666',
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1,
              color: '#666',
              font: {
                size: 12
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  drawDoughnutChart(): void {
    const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.doughnutChartInstance) {
      this.doughnutChartInstance.destroy();
    }

    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(255, 193, 7, 0.8)',
      'rgba(40, 167, 69, 0.8)',
      'rgba(220, 53, 69, 0.8)',
      'rgba(111, 66, 193, 0.8)',
      'rgba(253, 126, 20, 0.8)'
    ];

    const borderColors = [
      'rgba(102, 126, 234, 1)',
      'rgba(255, 193, 7, 1)',
      'rgba(40, 167, 69, 1)',
      'rgba(220, 53, 69, 1)',
      'rgba(111, 66, 193, 1)',
      'rgba(253, 126, 20, 1)'
    ];

    this.doughnutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.doughnutLabels,
        datasets: [{
          label: 'Services Rendered',
          data: this.doughnutData,
          backgroundColor: colors.slice(0, this.doughnutData.length),
          borderColor: borderColors.slice(0, this.doughnutData.length),
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              usePointStyle: true,
              color: '#666',
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 20
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  }


  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.monthlyChartInstance) {
          this.monthlyChartInstance.resize();
        }
        if (this.doughnutChartInstance) {
          this.doughnutChartInstance.resize();
        }
      });

      const container = document.querySelector('.dashboard-container');
      if (container) {
        this.resizeObserver.observe(container);
      }
    }
  }

  private addStaggerAnimation(): void {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
  }
}