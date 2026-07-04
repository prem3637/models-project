export interface DashboardStatsResponse {
    success: boolean;
    data: {
        totalModels: number;
        activeModels: number;
        avgAge: number;
        avgHeight: number;
        genderBreakdown: { Male: number; Female: number; Other: number };
        locationBreakdown: Array<{ city?: string; country: string; latitude?: string; longitude?: string; count: number }>;
        monthlyRegistrations: Array<{ month: string; count: number }>;
        recentModels: Array<{
            id: string;
            fullName: string;
            age: number;
            status: string;
            imageUrl: string;
        }>;
    };
}
