import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserType } from '../../helpers/requests/userType';
import './Dashboard.css';
import PageContainer from '../../components/simple/PageContainer';
import Widget from '../../components/widget/Widget';
import Grid from '../../components/grid/Grid';
import { getUser, isUserOfType, UserRoleType } from '../../helpers/utility';
import Actions from '../../components/action/Actions';
import { useNavigate } from 'react-router-dom';
import { pagedListFlags } from '../../helpers/pagedList';
import { actionsItemsConfig } from './DashboardConfig';
import { buildRecentViewColumns } from './recentViewColumns';
import { fetchRecentViews } from './recentViews';

const Dashboard = () => {
  const navigate = useNavigate();
  const loggedInUser = getUser();
  const userId = loggedInUser?.profile.preferred_username;

  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>(UserType.External);

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }

    loggedInUser
      ? setName(', ' + loggedInUser?.profile.given_name + ' ')
      : setName('');
  }, [loggedInUser]);

  const recentViewsQuery = useQuery({
    queryKey: ['recentViews', userId],
    queryFn: ({ signal }) => fetchRecentViews(userId ?? '', signal),
    enabled: Boolean(userId),
    retry: false,
  });

  const recentViews = recentViewsQuery.data ?? [];
  const { loading, fetching, empty } = pagedListFlags(
    recentViews.length,
    recentViewsQuery,
  );

  const handleActionItemClick = (item: any) => {
    switch (item.toLowerCase()) {
      case 'create-site':
        navigate('site/create');
        break;
      case 'search-site':
        navigate('/search');
        break;
      case 'view-sites-on-map':
        navigate('/map');
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer role="Dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="dashboard-title">Welcome{name}</h1>
        {userType === UserType.Internal && (
          <Actions
            label="Actions"
            items={actionsItemsConfig}
            onItemClick={handleActionItemClick}
          />
        )}
      </div>
      <Widget title="Recently Viewed" hideTable>
        <div className="me-1">
          <Grid
            label="Recently Viewed"
            rows={recentViews}
            columns={buildRecentViewColumns()}
            sort={null}
            onSortChange={() => {}}
            loading={loading}
            fetching={fetching}
            empty={empty}
          />
        </div>
      </Widget>
    </PageContainer>
  );
};

export default Dashboard;
