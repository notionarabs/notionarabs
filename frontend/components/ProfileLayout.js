import Navigation from './Navigation';
import ProfileSidebar from './ProfileSidebar';

export default function ProfileLayout({ children, userStatus }) {
    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
            <Navigation activePage="profile" />

            <div className="flex">
                {/* Sidebar */}
                <ProfileSidebar userStatus={userStatus} />

                {/* Main Content */}
                <main className="flex-1 min-h-screen lg:mr-64">
                    <div className="max-w-6xl mx-auto p-6 sm:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
