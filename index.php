<?php
// index.php
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

require __DIR__ . '/vendor/autoload.php';

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function registerBundles(): array
    {
        return [
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
        ];
    }

    protected function configureContainer(ContainerConfigurator $c): void
    {
        // PHP equivalent of config/packages/framework.yaml
        $c->extension('framework', [
            'secret' => 'S0ME_SECRET'
        ]);
    }

    const FILE = '/app/data/scores.json';

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->add('leaderboard', '/leaderboard')->methods(['GET'])->controller([$this, 'scores']);
        $routes->add('add_score', '/leaderboard')->methods(['POST'])->controller([$this, 'addScore']);
    }

    public function scores(Request $request): JsonResponse
    {
        return new JsonResponse($this->getScores($request->get('count')));
    }

    public function getScores($limit = 25)
    {
        if (!file_exists(self::FILE)) {
            file_put_contents(self::FILE, "[]");
        }

        $scores = json_decode(file_get_contents(self::FILE), true);
        if (count($scores) > $limit) {
            $scores = array_slice($scores, 0, $limit);
        }

        uasort($scores, function ($a, $b) {
            return $a['score'] <=> $b['score'];
        });
        return $scores;
    }

    public function addScore(Request $request): JsonResponse
    {
        if (empty($request->get('name')) || empty($request->get('score'))) {
            throw new \Symfony\Component\HttpFoundation\Exception\BadRequestException();
        }

        $name = trim($request->get('name'));
        if (strlen($name) > 3) {
            $name = substr($name, 0, 3);
        }
        $score = [
            'name' => substr($name, 0, 3),
            'score' => intval($request->get('score'))
        ];

        $allScores = json_decode(file_get_contents(self::FILE), true);
        $allScores[] = $score;
        uasort($allScores, function ($a, $b) {
            return $a['score'] <=> $b['score'];
        });
        file_put_contents(self::FILE, json_encode($allScores));

        return new JsonResponse($this->getScores($request->get('count')));
    }
}

$kernel = new Kernel('dev', true);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);